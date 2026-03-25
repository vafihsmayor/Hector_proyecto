import secrets
from datetime import timedelta
from django.utils import timezone
from django.db.models import Avg, Count, OuterRef, Subquery
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Alert, Beacon, Metric, UserAccount
from .serializers import AlertSerializer, BeaconSerializer, MetricSerializer, UserSerializer


class HealthView(APIView):
	def get(self, request):
		return Response({"status": "ok", "service": "backend-django"})


class LoginView(APIView):
	def post(self, request):
		username = request.data.get("username", "").strip()
		password = request.data.get("password", "")

		if not username or not password:
			return Response(
				{"detail": "Username y password son requeridos."},
				status=status.HTTP_400_BAD_REQUEST,
			)

		user = UserAccount.objects.filter(username=username, is_active=True).first()
		if not user or user.password_hash != password:
			return Response(
				{"detail": "Usuario o contrasena incorrectos."},
				status=status.HTTP_401_UNAUTHORIZED,
			)

		token = secrets.token_hex(24)
		return Response({"token": token, "user": UserSerializer(user).data})


class BeaconListView(APIView):
	def get(self, request):
		queryset = Beacon.objects.all().order_by("-created_at")
		return Response(BeaconSerializer(queryset, many=True).data)

	def post(self, request):
		serializer = BeaconSerializer(data=request.data)
		if serializer.is_valid():
			serializer.save()
			return Response(serializer.data, status=status.HTTP_201_CREATED)
		return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class BeaconDetailView(APIView):
	def get(self, request, beacon_id):
		beacon = Beacon.objects.filter(id=beacon_id).first()
		if not beacon:
			return Response({"detail": "Beacon no encontrado."}, status=status.HTTP_404_NOT_FOUND)
		return Response(BeaconSerializer(beacon).data)


class BeaconMetricsView(APIView):
	def get(self, request, beacon_id):
		limit = request.query_params.get("limit")
		days = request.query_params.get("days")
		
		queryset = Metric.objects.filter(beacon_id=beacon_id).order_by("-timestamp")
		
		if days and days.isdigit():
			start_date = timezone.now() - timedelta(days=int(days))
			queryset = queryset.filter(timestamp__gte=start_date)
            
		if limit and limit.isdigit():
			queryset = queryset[: int(limit)]
            
		return Response(MetricSerializer(queryset, many=True).data)


class AlertListView(APIView):
    def get(self, request):
        priority = request.query_params.get("priority")
        status_filter = request.query_params.get("status")
        
        queryset = Alert.objects.all().order_by("-created_at")
        
        if priority and priority != "all":
            queryset = queryset.filter(priority=priority)
        if status_filter and status_filter != "all":
            queryset = queryset.filter(status=status_filter)
            
        return Response(AlertSerializer(queryset, many=True).data)


class AlertActionView(APIView):
    def post(self, request, alert_id, action):
        alert = Alert.objects.filter(id=alert_id).first()
        if not alert:
            return Response({"detail": "Alerta no encontrada."}, status=status.HTTP_404_NOT_FOUND)
            
        if action == "acknowledge":
            alert.status = "acknowledged"
        elif action == "resolve":
            alert.status = "resolved"
        else:
            return Response({"detail": "Acción no válida."}, status=status.HTTP_400_BAD_REQUEST)
            
        alert.save()
        return Response(AlertSerializer(alert).data)


class DashboardSummaryView(APIView):
	def get(self, request):
		latest_battery_subquery = (
			Metric.objects.filter(beacon_id=OuterRef("pk")).order_by("-timestamp").values("battery_level")[:1]
		)

		beacons_with_latest_battery = Beacon.objects.annotate(
			latest_battery=Subquery(latest_battery_subquery)
		)

		status_counts = Beacon.objects.values("status").annotate(total=Count("id"))
		status_map = {row["status"]: row["total"] for row in status_counts}

		avg_battery = beacons_with_latest_battery.aggregate(avg=Avg("latest_battery"))["avg"]

		payload = {
			"total_beacons": Beacon.objects.count(),
			"active_beacons": status_map.get("active", 0),
			"inactive_beacons": status_map.get("inactive", 0),
			"disconnected_beacons": status_map.get("disconnected", 0),
			"maintenance_beacons": status_map.get("maintenance", 0),
			"avg_battery": float(avg_battery) if avg_battery is not None else 0,
			"active_alerts": Alert.objects.filter(status="active").count(),
		}

		return Response(payload)

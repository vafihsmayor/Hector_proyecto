import secrets
from django.db.models import Avg, Count, OuterRef, Subquery
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Beacon, Metric, UserAccount
from .serializers import BeaconSerializer, MetricSerializer, UserSerializer


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


class BeaconDetailView(APIView):
	def get(self, request, beacon_id):
		beacon = Beacon.objects.filter(id=beacon_id).first()
		if not beacon:
			return Response({"detail": "Beacon no encontrado."}, status=status.HTTP_404_NOT_FOUND)
		return Response(BeaconSerializer(beacon).data)


class BeaconMetricsView(APIView):
	def get(self, request, beacon_id):
		limit = request.query_params.get("limit")
		queryset = Metric.objects.filter(beacon_id=beacon_id).order_by("-timestamp")
		if limit and limit.isdigit():
			queryset = queryset[: int(limit)]
		return Response(MetricSerializer(queryset, many=True).data)


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
		}

		return Response(payload)

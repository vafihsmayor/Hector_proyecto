import secrets
from datetime import timedelta
from django.utils import timezone
from django.db.models import Avg, Count, OuterRef, Subquery
from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.http import HttpResponse
from openpyxl import Workbook
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet

from rest_framework_simplejwt.tokens import RefreshToken
from .models import Alert, Beacon, Metric, UserAccount
from .serializers import AlertSerializer, BeaconSerializer, MetricSerializer, UserSerializer
from .permissions import IsAdminRole, IsAdminOrReadOnly


def get_tokens_for_user(user):
    refresh = RefreshToken()
    refresh["user_id"] = str(user.id)
    refresh["role"] = user.role
    return {
        "refresh": str(refresh),
        "access": str(refresh.access_token),
    }


class HealthView(APIView):
    permission_classes = [permissions.AllowAny]
    def get(self, request):
        return Response({"status": "ok"})


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        username = request.data.get("username", "").strip()
        password = request.data.get("password", "")

        if not username or not password:
            return Response(
                {"detail": "Username y password son requeridos."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = UserAccount.objects.filter(username=username, is_active=True).first()
        # Note: In a real "Industrial Grade" app, we should use user.check_password(password)
        # But for now, we'll implement it to be compatible with existing data or set passwords.
        if not user or not user.check_password(password):
            return Response(
                {"detail": "Usuario o contrasena incorrectos."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        tokens = get_tokens_for_user(user)
        return Response({
            "refresh": tokens["refresh"],
            "access": tokens["access"],
            "user": UserSerializer(user).data
        })


class BeaconListView(APIView):
	permission_classes = [IsAdminOrReadOnly]
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
    permission_classes = [IsAdminRole]
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


class BeaconExportExcelView(APIView):
    def get(self, request, beacon_id):
        beacon = Beacon.objects.filter(id=beacon_id).first()
        if not beacon:
            return Response({"detail": "Beacon no encontrado."}, status=status.HTTP_404_NOT_FOUND)

        days = request.query_params.get("days", "30")
        queryset = Metric.objects.filter(beacon_id=beacon_id).order_by("-timestamp")
        if days.isdigit():
            start_date = timezone.now() - timedelta(days=int(days))
            queryset = queryset.filter(timestamp__gte=start_date)

        wb = Workbook()
        ws = wb.active
        ws.title = "Histórico de Métricas"

        # Headers
        headers = ["Timestamp", "Batería (%)", "Señal (dBm)"]
        ws.append(headers)

        # Data
        for metric in queryset:
            ws.append([
                metric.timestamp.strftime("%Y-%m-%d %H:%M:%S") if metric.timestamp else "N/A",
                float(metric.battery_level) if metric.battery_level is not None else "N/A",
                float(metric.signal_strength) if metric.signal_strength is not None else "N/A"
            ])

        response = HttpResponse(
            content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        )
        response["Content-Disposition"] = f'attachment; filename="historico_{beacon.device_id}.xlsx"'
        wb.save(response)
        return response


class BeaconExportPDFView(APIView):
    def get(self, request, beacon_id):
        beacon = Beacon.objects.filter(id=beacon_id).first()
        if not beacon:
            return Response({"detail": "Beacon no encontrado."}, status=status.HTTP_404_NOT_FOUND)

        days = request.query_params.get("days", "30")
        queryset = Metric.objects.filter(beacon_id=beacon_id).order_by("-timestamp")
        if days.isdigit():
            start_date = timezone.now() - timedelta(days=int(days))
            queryset = queryset.filter(timestamp__gte=start_date)

        response = HttpResponse(content_type="application/pdf")
        response["Content-Disposition"] = f'attachment; filename="historico_{beacon.device_id}.pdf"'

        doc = SimpleDocTemplate(response, pagesize=letter)
        elements = []
        styles = getSampleStyleSheet()

        # Title
        elements.append(Paragraph(f"Reporte de Histórico: {beacon.name} ({beacon.device_id})", styles["Title"]))
        elements.append(Spacer(1, 12))
        elements.append(Paragraph(f"Fecha de reporte: {timezone.now().strftime('%Y-%m-%d %H:%M:%S')}", styles["Normal"]))
        elements.append(Spacer(1, 24))

        # Table Data
        data = [["Timestamp", "Batería (%)", "Señal (dBm)"]]
        for metric in queryset[:500]: # Limit PDF to 500 rows for performance
            data.append([
                metric.timestamp.strftime("%Y-%m-%d %H:%M:%S") if metric.timestamp else "N/A",
                f"{metric.battery_level}%" if metric.battery_level is not None else "N/A",
                f"{metric.signal_strength} dBm" if metric.signal_strength is not None else "N/A"
            ])

        if not queryset.exists():
            data.append(["No hay datos registrados", "-", "-"])

        t = Table(data)
        t.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        elements.append(t)
        
        doc.build(elements)
        return response


class GlobalExportExcelView(APIView):
    def get(self, request):
        days = request.query_params.get("days", "30")
        queryset = Metric.objects.all().order_by("-timestamp")
        if days.isdigit():
            start_date = timezone.now() - timedelta(days=int(days))
            queryset = queryset.filter(timestamp__gte=start_date)

        wb = Workbook()
        ws = wb.active
        ws.title = "Reporte Global de Métricas"

        # Headers
        headers = ["Dispositivo", "Beacon ID", "Timestamp", "Batería (%)", "Señal (dBm)"]
        ws.append(headers)

        # Data (Limit to 1000 for performance in Excel)
        for metric in queryset[:1000]:
            ws.append([
                metric.beacon.name,
                metric.beacon.device_id,
                metric.timestamp.strftime("%Y-%m-%d %H:%M:%S") if metric.timestamp else "N/A",
                float(metric.battery_level) if metric.battery_level is not None else "N/A",
                float(metric.signal_strength) if metric.signal_strength is not None else "N/A"
            ])

        response = HttpResponse(
            content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        )
        response["Content-Disposition"] = 'attachment; filename="reporte_global.xlsx"'
        wb.save(response)
        return response


class GlobalExportPDFView(APIView):
    def get(self, request):
        days = request.query_params.get("days", "30")
        queryset = Metric.objects.all().order_by("-timestamp")
        if days.isdigit():
            start_date = timezone.now() - timedelta(days=int(days))
            queryset = queryset.filter(timestamp__gte=start_date)

        response = HttpResponse(content_type="application/pdf")
        response["Content-Disposition"] = 'attachment; filename="reporte_global.pdf"'

        doc = SimpleDocTemplate(response, pagesize=letter)
        elements = []
        styles = getSampleStyleSheet()

        elements.append(Paragraph("Reporte Global de Monitoreo", styles["Title"]))
        elements.append(Spacer(1, 12))
        elements.append(Paragraph(f"Fecha de reporte: {timezone.now().strftime('%Y-%m-%d %H:%M:%S')}", styles["Normal"]))
        elements.append(Spacer(1, 24))

        data = [["Dispositivo", "ID", "Timestamp", "Batt", "RSSI"]]
        for metric in queryset[:500]:
            data.append([
                metric.beacon.name[:10],
                metric.beacon.device_id[:10],
                metric.timestamp.strftime("%m-%d %H:%M") if metric.timestamp else "N/A",
                f"{metric.battery_level}%",
                f"{metric.signal_strength}"
            ])

        if not queryset.exists():
            data.append(["N/A", "N/A", "No hay datos", "-", "-"])

        t = Table(data)
        t.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        elements.append(t)
        
        doc.build(elements)
        return response

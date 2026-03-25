from django.urls import path

from .views import (
    AlertActionView,
    AlertListView,
    BeaconDetailView,
    BeaconListView,
    BeaconMetricsView,
    DashboardSummaryView,
    HealthView,
    LoginView,
)

urlpatterns = [
    path("health/", HealthView.as_view(), name="health"),
    path("auth/login/", LoginView.as_view(), name="login"),
    path("beacons/", BeaconListView.as_view(), name="beacon-list"),
    path("beacons/<uuid:beacon_id>/", BeaconDetailView.as_view(), name="beacon-detail"),
    path("beacons/<uuid:beacon_id>/metrics/", BeaconMetricsView.as_view(), name="beacon-metrics"),
    path("alerts/", AlertListView.as_view(), name="alert-list"),
    path("alerts/<uuid:alert_id>/<str:action>/", AlertActionView.as_view(), name="alert-action"),
    path("dashboard/summary/", DashboardSummaryView.as_view(), name="dashboard-summary"),
]

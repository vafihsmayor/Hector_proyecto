from django.urls import path

from .views import (
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
    path("dashboard/summary/", DashboardSummaryView.as_view(), name="dashboard-summary"),
]

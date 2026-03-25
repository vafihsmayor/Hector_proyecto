from rest_framework import serializers

from .models import Beacon, Metric, UserAccount


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserAccount
        fields = ["id", "username", "email", "role", "is_active", "created_at", "updated_at"]


class BeaconSerializer(serializers.ModelSerializer):
    class Meta:
        model = Beacon
        fields = "__all__"


class MetricSerializer(serializers.ModelSerializer):
    class Meta:
        model = Metric
        fields = "__all__"

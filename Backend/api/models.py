from django.db import models


class UserAccount(models.Model):
	id = models.UUIDField(primary_key=True)
	username = models.TextField(unique=True)
	email = models.TextField(unique=True)
	password_hash = models.TextField()
	role = models.TextField()
	is_active = models.BooleanField(default=True)
	created_at = models.DateTimeField()
	updated_at = models.DateTimeField()

	class Meta:
		managed = False
		db_table = "users"


class Beacon(models.Model):
	STATUS_CHOICES = [
		("active", "active"),
		("inactive", "inactive"),
		("disconnected", "disconnected"),
		("maintenance", "maintenance"),
	]

	id = models.UUIDField(primary_key=True)
	device_id = models.TextField(unique=True)
	name = models.TextField()
	model = models.TextField()
	status = models.TextField(choices=STATUS_CHOICES)
	enrolled_at = models.DateTimeField(null=True, blank=True)
	last_seen = models.DateTimeField(null=True, blank=True)
	location = models.TextField(null=True, blank=True)
	created_at = models.DateTimeField()
	updated_at = models.DateTimeField()

	class Meta:
		managed = False
		db_table = "beacons"


class Metric(models.Model):
	id = models.UUIDField(primary_key=True)
	beacon = models.ForeignKey(Beacon, on_delete=models.CASCADE, related_name="metrics")
	battery_level = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
	signal_strength = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
	timestamp = models.DateTimeField()
	created_at = models.DateTimeField()

	class Meta:
		managed = False
		db_table = "metrics"

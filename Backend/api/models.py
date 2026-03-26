import uuid
from django.db import models


from django.contrib.auth.hashers import make_password, check_password


class UserAccount(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    username = models.CharField(max_length=255, unique=True)
    email = models.EmailField(unique=True)
    password_hash = models.TextField(db_column="password_hash")
    role = models.TextField(default="viewer")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Required for JWT for_user(user) compatibility
    @property
    def is_authenticated(self):
        return True

    def set_password(self, raw_password):
        self.password_hash = make_password(raw_password)

    def check_password(self, raw_password):
        return check_password(raw_password, self.password_hash)

    # SimpleJWT needs this
    def __str__(self):
        return self.username

    class Meta:
        managed = False
        db_table = "users"


class Alert(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    beacon = models.ForeignKey('Beacon', on_delete=models.CASCADE, related_name="alerts")
    type = models.TextField()
    priority = models.TextField()
    message = models.TextField()
    status = models.TextField(default='active')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False
        db_table = "alerts"


class Beacon(models.Model):
	STATUS_CHOICES = [
		("active", "active"),
		("inactive", "inactive"),
		("disconnected", "disconnected"),
		("maintenance", "maintenance"),
	]

	id = models.UUIDField(primary_key=True, default=uuid.uuid4)
	device_id = models.TextField(unique=True)
	name = models.TextField()
	model = models.TextField()
	status = models.TextField(choices=STATUS_CHOICES, default="active")
	enrolled_at = models.DateTimeField(auto_now_add=True)
	last_seen = models.DateTimeField(auto_now_add=True)
	location = models.TextField(null=True, blank=True)
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	class Meta:
		managed = False
		db_table = "beacons"


class Metric(models.Model):
	id = models.UUIDField(primary_key=True, default=uuid.uuid4)
	beacon = models.ForeignKey(Beacon, on_delete=models.CASCADE, related_name="metrics")
	battery_level = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
	signal_strength = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
	timestamp = models.DateTimeField(auto_now_add=True)
	created_at = models.DateTimeField(auto_now_add=True)

	class Meta:
		managed = False
		db_table = "metrics"

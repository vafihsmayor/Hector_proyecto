from rest_framework import permissions

class IsAdminRole(permissions.BasePermission):
    """
    Allows access only to users with the 'admin' role.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'admin')

class IsViewerRole(permissions.BasePermission):
    """
    Allows access to users with 'admin' or 'viewer' role.
    """
    def has_permission(self, request, view):
        # Admin can do everything, viewer can also see
        return bool(request.user and request.user.is_authenticated and (request.user.role == 'admin' or request.user.role == 'viewer'))

class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Admin can perform any action, others can only read.
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return request.user and request.user.is_authenticated
        return bool(request.user and request.user.is_authenticated and request.user.role == 'admin')

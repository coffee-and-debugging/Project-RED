from rest_framework import permissions

class IsHospitalUserAuthenticated(permissions.BasePermission):
    """
    Allows access only to authenticated hospital users.
    """
    def has_permission(self, request, view):
        return bool(request.user and hasattr(request.user, 'is_authenticated') and request.user.is_authenticated)
from django.contrib import admin
from .models import Profile, Role
from django.contrib import admin
from .models import (Role, Actor, Play, TheaterHall, Seat, 
                    Panorama, PanoramaLink, Session, TicketStatus, Ticket, Basket, 
                    ActionLog, AIPrediction, Genre, Sector, SessionActor, WeekdayCoefficient, TimeCoefficient, Holiday)



@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ('profile_id', 'user', 'role', 'phone', 'created_at')
    list_filter = ('role', 'created_at')
    search_fields = ('user__username', 'user__email', 'phone')
    raw_id_fields = ('user',)
    fields = ('user', 'role', 'phone')

# регистрация
admin.site.register(Role)
admin.site.register(Actor)
admin.site.register(Play)
admin.site.register(SessionActor)
admin.site.register(Genre)
admin.site.register(TheaterHall)
admin.site.register(Seat)
admin.site.register(Sector)
admin.site.register(Panorama)
admin.site.register(PanoramaLink)
admin.site.register(Session)
admin.site.register(TicketStatus)
admin.site.register(Ticket)
admin.site.register(Basket)
admin.site.register(ActionLog)
admin.site.register(AIPrediction)
admin.site.register(WeekdayCoefficient)
admin.site.register(TimeCoefficient)
admin.site.register(Holiday)

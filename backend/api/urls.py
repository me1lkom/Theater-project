from django.urls import path
from . import views, views_auth
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('plays/', views.PlayListView.as_view(), name='play-list'), #as_view - гтовый класс Django Rest
    path('plays/<int:pk>/', views.PlayDetailView.as_view(), name='play-detail'),
    path('plays/manage/', views.manage_play),
    path('plays/manage/<int:play_id>/', views.manage_play),
    path('plays/manage/', views.manage_plays, name='manage-plays'),
    path('plays/manage/<int:play_id>/', views.manage_plays, name='manage-play-detail'),

    path('genres/', views.GenreView.as_view(), name='genre-list'),

    path('sessions/manage/', views.manage_sessions, name='manage-sessions'), # все сеансы
    path('sessions/manage/<int:session_id>/', views.manage_sessions, name='manage-session-detail'),
    path('sessions/', views.SessionListView.as_view(), name='session-list'), # только будующие сеансы
    # path('sessions/<int:pk>/', views.SessionDetailView.as_view(), name='session-detail'),
    path('sessions/<int:pk>/available-seats/', views.available_seats, name='available-seats'),

    path('seats/manage/', views.manage_seats, name='manage-seats'),
    path('seats/manage/bulk/', views.manage_seats, name='bulk-create-seats'),
    path('seats/manage/clear/', views.manage_seats, name='clear-sector-seats'),
    path('seats/manage/detail/<int:seat_id>/', views.manage_seat_detail, name='manage-seat-detail'),
    path('seats/', views.SeatListView.as_view(), name='seat-list'),

    path('basket/add/', views.add_to_basket, name='add-to-basket'),
    path('basket/my/', views.my_basket, name='my-basket'),
    path('basket/add/bulk/', views.add_to_basket_bulk, name='add-to-basket-bulk'),
    path('basket/remove/<int:basket_id>/', views.remove_from_basket, name='remove-from-basket'),
    path('basket/check-expired/', views.check_expired_baskets, name='check-expired'),

    path('tickets/my/', views.my_tickets, name='my-tickets'),
    path('tickets/all/', views.all_tickets, name='all-tickets'),
    path('tickets/buy/', views.buy_ticket, name='buy-ticket'),
    path('tickets/buy/bulk/', views.buy_tickets_bulk, name='buy-tickets-bulk'),
    path('ticket-statuses/', views.TicketStatusListView.as_view(), name='ticket-statuses'),
    path('tickets/return/<int:ticket_id>/', views.return_ticket, name='return-ticket'),
    path('tickets/my/', views.my_tickets, name='my-tickets'),
    
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    path('auth/login/', views_auth.login_cookie, name='login'),
    path('auth/register/', views_auth.register_cookie, name='register'),
    path('auth/refresh/', views_auth.refresh_cookie, name='refresh'),
    path('auth/logout/', views_auth.logout_cookie, name='logout'),
    path('auth/me/', views_auth.me_cookie, name='me'),

    # path('halls/', views.manage_halls, name='halls'),
    # path('halls/<int:hall_id>/', views.manage_halls, name='hall-detail'),

    path('sectors/', views.manage_sectors, name='sectors'),
    path('sectors/<int:sector_id>/', views.manage_sectors, name='sector-detail'),

    path('admin/logs/', views.action_log, name='action-log'),
    path('admin/logs/', views.action_log_list, name='action-logs'),
    path('admin/logs/types/', views.action_types, name='action-types'), 

    path('panorama/', views.PanoramaView.as_view(), name='panorama-detail'),
    path('panorama/<int:panorama_id>/', views.get_panorama_by_id, name='panorama-by-id'), 
    path('panorama/default/', views.get_default_panorama, name='default-panorama'),
    path('panoramas/manage/', views.manage_panoramas, name='manage-panoramas'),
    path('panoramas/manage/<int:panorama_id>/', views.manage_panoramas, name='manage-panorama-detail'),
    path('panorama/by-seat/', views.get_panorama_by_seat, name='panorama-by-seat'),  


    path('ml/train/', views.train_ml_model, name='train-ml'),
    path('ml/demand-predict/', views.predict_demand_ml, name='predict-ml'),
    path('ml/info/', views.model_info, name='model-info'),
]
# En Django - services/jwt_service.py
import jwt
import datetime
from django.conf import settings

class JWTService:
    @staticmethod
    def generate_payment_token(user_id, order_data):
        payload = {
            'user_id': user_id,
            'order_data': order_data,
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=1),
            'iat': datetime.datetime.utcnow()
        }
        return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm='HS256')
    
    @staticmethod
    def verify_payment_token(token):
        try:
            payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=['HS256'])
            return payload
        except jwt.ExpiredSignatureError:
            return None
        except jwt.InvalidTokenError:
            return None
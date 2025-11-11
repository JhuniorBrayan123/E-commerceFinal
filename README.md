# E-commerce con Microservicios

Proyecto de e-commerce usando Django, Spring Boot y React con Docker.

## Servicios
- Frontend: React (puerto 3000)
- API Gateway: Spring Boot (puerto 8080) 
- Catalog Service: Django (puerto 8001)
- Order Service: Spring Boot (puerto 8002)
- Database: PostgreSQL (puerto 5432)

## Comandos
```bash
# Iniciar todos los servicios
docker-compose up

# Iniciar en segundo plano
docker-compose up -d

# Ver logs
docker-compose logs

# Detener servicios
docker-compose down# E-commerceFinal

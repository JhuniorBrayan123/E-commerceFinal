import requests
import json

print("=" * 60)
print("PRUEBA DE CONECTIVIDAD DE MICROSERVICIOS")
print("=" * 60)

# Test 1: Auth Service - Register
print("\n1️⃣ Probando AUTH-SERVICE (PHP) - Registro de usuario...")
try:
    response = requests.post(
        "http://localhost:8081/register.php",
        json={
            "username": f"test_user_verificacion",
            "email": f"test_verificacion@example.com",
            "password": "Test123456"
        },
        timeout=5
    )
    print(f"   Status: {response.status_code}")
    print(f"   Response: {response.text[:200]}")
    if response.status_code in [200, 201]:
        print("   ✅ Auth-service respondió correctamente")
    else:
        print(f"   ⚠️  Auth-service respondió con código: {response.status_code}")
except Exception as e:
    print(f"   ❌ Error: {e}")

# Test 2: Django Service - Lista de sensores
print("\n2️⃣ Probando DJANGO-SERVICE - Lista de sensores...")
try:
    response = requests.get("http://localhost:8000/api/sensores/", timeout=5)
    print(f"   Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"   Total sensores: {data.get('count', 'N/A')}")
        print("   ✅ Django-service respondió correctamente")
    else:
        print(f"   Response: {response.text[:200]}")
except Exception as e:
    print(f"   ❌ Error: {e}")

# Test 3: Payment Service - Health check
print("\n3️⃣ Probando PAYMENT-SERVICE (Spring Boot)...")
try:
    response = requests.get("http://localhost:8085/actuator/health", timeout=5)
    print(f"   Status: {response.status_code}")
    print(f"   Response: {response.text[:200]}")
    if response.status_code == 200:
        print("   ✅ Payment-service respondió correctamente")
except Exception as e:
    # Intentar otro endpoint si actuator no está disponible
    try:
        response = requests.get("http://localhost:8085/orders", timeout=5)
        print(f"   Status (orders): {response.status_code}")
        if response.status_code in [200, 401, 403]:  # Puede requerir auth
            print("   ✅ Payment-service está activo")
    except Exception as e2:
        print(f"   ❌ Error: {e2}")

print("\n" + "=" * 60)
print("PRUEBA COMPLETADA")
print("=" * 60)

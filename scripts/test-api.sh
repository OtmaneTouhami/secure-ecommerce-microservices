#!/bin/bash

# ============================================================
# E-commerce Microservices API Test Script
# Comprehensive testing of all endpoints with ADMIN and CLIENT roles
# ============================================================

# Configuration
GATEWAY_URL="${GATEWAY_URL:-http://localhost:8888}"
KEYCLOAK_URL="${KEYCLOAK_URL:-http://localhost:8080}"
REALM="ecommerce-realm"
CLIENT_ID="ecommerce-gateway"
CLIENT_SECRET="gateway-secret-key"
TIMEOUT=10

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

# Counters
PASSED=0
FAILED=0
TOTAL=0

# Stored IDs
PRODUCT1_ID=""
PRODUCT2_ID=""
PRODUCT3_ID=""
ORDER1_ID=""
ORDER2_ID=""
ORDER3_ID=""

# ============================================================
# Helper Functions
# ============================================================

print_header() {
    echo ""
    echo -e "${BLUE}============================================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}============================================================${NC}"
}

print_subheader() {
    echo ""
    echo -e "${CYAN}--- $1 ---${NC}"
}

print_test() {
    echo -e "${YELLOW}TEST: $1${NC}"
}

print_pass() {
    echo -e "${GREEN}✓ PASS: $1${NC}"
    ((PASSED++))
    ((TOTAL++))
}

print_fail() {
    echo -e "${RED}✗ FAIL: $1${NC}"
    if [ -n "$2" ]; then
        echo -e "${RED}  Response: $(echo "$2" | head -c 200)${NC}"
    fi
    ((FAILED++))
    ((TOTAL++))
}

print_info() {
    echo -e "${MAGENTA}  → $1${NC}"
}

get_token() {
    local username=$1
    local password=$2
    
    TOKEN_RESPONSE=$(curl -s --max-time $TIMEOUT -X POST \
        "${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/token" \
        -H "Content-Type: application/x-www-form-urlencoded" \
        -d "client_id=${CLIENT_ID}" \
        -d "client_secret=${CLIENT_SECRET}" \
        -d "grant_type=password" \
        -d "username=${username}" \
        -d "password=${password}")
    
    echo "$TOKEN_RESPONSE" | grep -o '"access_token":"[^"]*' | cut -d'"' -f4
}

api_request() {
    local method=$1
    local endpoint=$2
    local token=$3
    local data=$4
    local expected_status=$5
    local description=$6
    
    print_test "$description"
    
    if [ -n "$data" ]; then
        RESPONSE=$(curl -s --max-time $TIMEOUT -w "\n%{http_code}" -X "$method" \
            "${GATEWAY_URL}${endpoint}" \
            -H "Authorization: Bearer $token" \
            -H "Content-Type: application/json" \
            -d "$data" 2>/dev/null)
    else
        RESPONSE=$(curl -s --max-time $TIMEOUT -w "\n%{http_code}" -X "$method" \
            "${GATEWAY_URL}${endpoint}" \
            -H "Authorization: Bearer $token" \
            -H "Content-Type: application/json" 2>/dev/null)
    fi
    
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | sed '$d')
    
    if [ "$HTTP_CODE" = "$expected_status" ]; then
        print_pass "$description (HTTP $HTTP_CODE)"
        echo "$BODY"
        return 0
    else
        print_fail "$description (Expected: $expected_status, Got: $HTTP_CODE)" "$BODY"
        return 1
    fi
}

api_request_silent() {
    local method=$1
    local endpoint=$2
    local token=$3
    local data=$4
    local expected_status=$5
    local description=$6
    
    print_test "$description"
    
    if [ -n "$data" ]; then
        RESPONSE=$(curl -s --max-time $TIMEOUT -w "\n%{http_code}" -X "$method" \
            "${GATEWAY_URL}${endpoint}" \
            -H "Authorization: Bearer $token" \
            -H "Content-Type: application/json" \
            -d "$data" 2>/dev/null)
    else
        RESPONSE=$(curl -s --max-time $TIMEOUT -w "\n%{http_code}" -X "$method" \
            "${GATEWAY_URL}${endpoint}" \
            -H "Authorization: Bearer $token" \
            -H "Content-Type: application/json" 2>/dev/null)
    fi
    
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | sed '$d')
    
    if [ "$HTTP_CODE" = "$expected_status" ]; then
        print_pass "$description (HTTP $HTTP_CODE)"
        return 0
    else
        print_fail "$description (Expected: $expected_status, Got: $HTTP_CODE)" "$BODY"
        return 1
    fi
}

extract_id() {
    echo "$1" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4
}

# ============================================================
# Wait for Services
# ============================================================

print_header "Waiting for Services to be Ready"

echo "Waiting for Keycloak..."
for i in {1..30}; do
    if curl -s --max-time 5 "${KEYCLOAK_URL}/realms/${REALM}" | grep -q "ecommerce-realm"; then
        echo -e "${GREEN}Keycloak is ready${NC}"
        break
    fi
    echo "  Keycloak not ready, waiting... ($i/30)"
    sleep 2
done

echo "Waiting for Gateway..."
for i in {1..30}; do
    if curl -s --max-time 5 "${GATEWAY_URL}/actuator/health" | grep -q "UP"; then
        echo -e "${GREEN}Gateway is ready${NC}"
        break
    fi
    echo "  Gateway not ready, waiting... ($i/30)"
    sleep 2
done

# ============================================================
# Get Tokens
# ============================================================

print_header "Authenticating Users"

echo "Getting ADMIN token..."
ADMIN_TOKEN=$(get_token "admin" "admin123")
if [ -z "$ADMIN_TOKEN" ]; then
    echo -e "${RED}Failed to get admin token!${NC}"
    exit 1
fi
echo -e "${GREEN}Admin token obtained${NC}"

echo "Getting CLIENT token..."
CLIENT_TOKEN=$(get_token "client" "client123")
if [ -z "$CLIENT_TOKEN" ]; then
    echo -e "${RED}Failed to get client token!${NC}"
    exit 1
fi
echo -e "${GREEN}Client token obtained${NC}"

# ============================================================
# PRODUCT SERVICE TESTS
# ============================================================

print_header "PRODUCT SERVICE TESTS"

# ------------ ADMIN ROLE - Create Products ------------
print_subheader "ADMIN: Create Products"

RESULT=$(api_request "POST" "/product-service/api/products" "$ADMIN_TOKEN" \
    '{"name":"Gaming Laptop","description":"High-performance gaming laptop with RTX 4080","price":1999.99,"stockQuantity":25}' \
    "201" "Create Product 1 (Gaming Laptop)")
PRODUCT1_ID=$(extract_id "$RESULT")
print_info "Product 1 ID: $PRODUCT1_ID"

RESULT=$(api_request "POST" "/product-service/api/products" "$ADMIN_TOKEN" \
    '{"name":"Wireless Mouse","description":"Ergonomic wireless mouse with RGB","price":49.99,"stockQuantity":100}' \
    "201" "Create Product 2 (Wireless Mouse)")
PRODUCT2_ID=$(extract_id "$RESULT")
print_info "Product 2 ID: $PRODUCT2_ID"

RESULT=$(api_request "POST" "/product-service/api/products" "$ADMIN_TOKEN" \
    '{"name":"Mechanical Keyboard","description":"Cherry MX Blue switches, RGB backlit","price":129.99,"stockQuantity":8}' \
    "201" "Create Product 3 (Mechanical Keyboard - Low Stock)")
PRODUCT3_ID=$(extract_id "$RESULT")
print_info "Product 3 ID: $PRODUCT3_ID"

RESULT=$(api_request "POST" "/product-service/api/products" "$ADMIN_TOKEN" \
    '{"name":"USB-C Hub","description":"7-in-1 USB-C hub with HDMI and PD","price":39.99,"stockQuantity":50}' \
    "201" "Create Product 4 (USB-C Hub)")
PRODUCT4_ID=$(extract_id "$RESULT")
print_info "Product 4 ID: $PRODUCT4_ID"

RESULT=$(api_request "POST" "/product-service/api/products" "$ADMIN_TOKEN" \
    '{"name":"Monitor Stand","description":"Adjustable aluminum monitor stand","price":79.99,"stockQuantity":3}' \
    "201" "Create Product 5 (Monitor Stand - Very Low Stock)")
PRODUCT5_ID=$(extract_id "$RESULT")
print_info "Product 5 ID: $PRODUCT5_ID"

# ------------ ADMIN ROLE - Read Products ------------
print_subheader "ADMIN: Read Products"

api_request "GET" "/product-service/api/products" "$ADMIN_TOKEN" "" "200" "Get All Products"

api_request "GET" "/product-service/api/products/${PRODUCT1_ID}" "$ADMIN_TOKEN" "" "200" "Get Product by ID"

api_request "GET" "/product-service/api/products/search?name=Laptop" "$ADMIN_TOKEN" "" "200" "Search Products by Name (Laptop)"

api_request "GET" "/product-service/api/products/search?name=Mouse" "$ADMIN_TOKEN" "" "200" "Search Products by Name (Mouse)"

api_request "GET" "/product-service/api/products/in-stock" "$ADMIN_TOKEN" "" "200" "Get In-Stock Products"

api_request "GET" "/product-service/api/products/low-stock?threshold=10" "$ADMIN_TOKEN" "" "200" "Get Low-Stock Products (threshold=10)"

api_request "GET" "/product-service/api/products/low-stock?threshold=5" "$ADMIN_TOKEN" "" "200" "Get Low-Stock Products (threshold=5)"

# ------------ ADMIN ROLE - Update Products ------------
print_subheader "ADMIN: Update Products"

api_request "PUT" "/product-service/api/products/${PRODUCT1_ID}" "$ADMIN_TOKEN" \
    '{"name":"Gaming Laptop Pro","description":"Updated: High-performance gaming laptop with RTX 4090","price":2499.99,"stockQuantity":20}' \
    "200" "Update Product 1 (Price and Description)"

api_request "PUT" "/product-service/api/products/${PRODUCT2_ID}" "$ADMIN_TOKEN" \
    '{"name":"Wireless Mouse Elite","description":"Premium ergonomic wireless mouse","price":69.99,"stockQuantity":80}' \
    "200" "Update Product 2 (Name and Price)"

# ------------ ADMIN ROLE - Stock Operations ------------
print_subheader "ADMIN: Stock Operations"

api_request "GET" "/product-service/api/products/${PRODUCT1_ID}/check-stock?quantity=5" "$ADMIN_TOKEN" "" "200" "Check Stock - Sufficient (5 units)"

api_request "GET" "/product-service/api/products/${PRODUCT1_ID}/check-stock?quantity=100" "$ADMIN_TOKEN" "" "200" "Check Stock - Insufficient (100 units)"

api_request_silent "PUT" "/product-service/api/products/${PRODUCT4_ID}/reduce-stock?quantity=10" "$ADMIN_TOKEN" "" "200" "Reduce Stock by 10 units"

# ------------ ADMIN ROLE - Validation Tests ------------
print_subheader "ADMIN: Validation Tests"

api_request_silent "POST" "/product-service/api/products" "$ADMIN_TOKEN" \
    '{"name":"","description":"Invalid product","price":10.00,"stockQuantity":5}' \
    "400" "Create Product with Empty Name (Should Fail)"

api_request_silent "POST" "/product-service/api/products" "$ADMIN_TOKEN" \
    '{"name":"Test Product","description":"Invalid price","price":-10.00,"stockQuantity":5}' \
    "400" "Create Product with Negative Price (Should Fail)"

api_request_silent "GET" "/product-service/api/products/nonexistent-id-12345" "$ADMIN_TOKEN" "" "404" "Get Non-existent Product (Should Return 404)"

# ------------ CLIENT ROLE - Product Access ------------
print_subheader "CLIENT: Product Access (Read-Only)"

api_request "GET" "/product-service/api/products" "$CLIENT_TOKEN" "" "200" "CLIENT: Get All Products"

api_request "GET" "/product-service/api/products/${PRODUCT1_ID}" "$CLIENT_TOKEN" "" "200" "CLIENT: Get Product by ID"

api_request "GET" "/product-service/api/products/search?name=Keyboard" "$CLIENT_TOKEN" "" "200" "CLIENT: Search Products"

api_request "GET" "/product-service/api/products/in-stock" "$CLIENT_TOKEN" "" "200" "CLIENT: Get In-Stock Products"

# ------------ CLIENT ROLE - Forbidden Operations ------------
print_subheader "CLIENT: Forbidden Operations"

api_request_silent "POST" "/product-service/api/products" "$CLIENT_TOKEN" \
    '{"name":"Unauthorized Product","description":"Should fail","price":10.00,"stockQuantity":5}' \
    "403" "CLIENT: Create Product (Should be FORBIDDEN)"

api_request_silent "PUT" "/product-service/api/products/${PRODUCT1_ID}" "$CLIENT_TOKEN" \
    '{"name":"Hacked Product","description":"Should fail","price":1.00,"stockQuantity":999}' \
    "403" "CLIENT: Update Product (Should be FORBIDDEN)"

api_request_silent "DELETE" "/product-service/api/products/${PRODUCT1_ID}" "$CLIENT_TOKEN" "" \
    "403" "CLIENT: Delete Product (Should be FORBIDDEN)"

api_request_silent "GET" "/product-service/api/products/low-stock?threshold=10" "$CLIENT_TOKEN" "" \
    "403" "CLIENT: Get Low-Stock (Should be FORBIDDEN)"

# ============================================================
# ORDER SERVICE TESTS
# ============================================================

print_header "ORDER SERVICE TESTS"

# ------------ CLIENT ROLE - Create Orders ------------
print_subheader "CLIENT: Create Orders"

RESULT=$(api_request "POST" "/command-service/api/orders" "$CLIENT_TOKEN" \
    "{\"items\":[{\"productId\":\"${PRODUCT1_ID}\",\"quantity\":2},{\"productId\":\"${PRODUCT2_ID}\",\"quantity\":1}]}" \
    "201" "Create Order 1 (2 Laptops + 1 Mouse)")
ORDER1_ID=$(extract_id "$RESULT")
print_info "Order 1 ID: $ORDER1_ID"

RESULT=$(api_request "POST" "/command-service/api/orders" "$CLIENT_TOKEN" \
    "{\"items\":[{\"productId\":\"${PRODUCT3_ID}\",\"quantity\":1}]}" \
    "201" "Create Order 2 (1 Keyboard)")
ORDER2_ID=$(extract_id "$RESULT")
print_info "Order 2 ID: $ORDER2_ID"

RESULT=$(api_request "POST" "/command-service/api/orders" "$CLIENT_TOKEN" \
    "{\"items\":[{\"productId\":\"${PRODUCT4_ID}\",\"quantity\":3},{\"productId\":\"${PRODUCT2_ID}\",\"quantity\":2}]}" \
    "201" "Create Order 3 (3 USB-C Hubs + 2 Mice)")
ORDER3_ID=$(extract_id "$RESULT")
print_info "Order 3 ID: $ORDER3_ID"

# ------------ CLIENT ROLE - Read Own Orders ------------
print_subheader "CLIENT: Read Own Orders"

api_request "GET" "/command-service/api/orders/my-orders" "$CLIENT_TOKEN" "" "200" "CLIENT: Get My Orders"

api_request "GET" "/command-service/api/orders/${ORDER1_ID}" "$CLIENT_TOKEN" "" "200" "CLIENT: Get Order 1 by ID"

api_request "GET" "/command-service/api/orders/${ORDER1_ID}/items" "$CLIENT_TOKEN" "" "200" "CLIENT: Get Order 1 Items"

api_request "GET" "/command-service/api/orders/${ORDER2_ID}/items" "$CLIENT_TOKEN" "" "200" "CLIENT: Get Order 2 Items"

# ------------ CLIENT ROLE - Forbidden Order Operations ------------
print_subheader "CLIENT: Forbidden Order Operations"

api_request_silent "GET" "/command-service/api/orders" "$CLIENT_TOKEN" "" \
    "403" "CLIENT: Get All Orders (Should be FORBIDDEN)"

api_request_silent "GET" "/command-service/api/orders/status/CONFIRMED" "$CLIENT_TOKEN" "" \
    "403" "CLIENT: Get Orders by Status (Should be FORBIDDEN)"

api_request_silent "PUT" "/command-service/api/orders/${ORDER1_ID}/status?status=SHIPPED" "$CLIENT_TOKEN" "" \
    "403" "CLIENT: Update Order Status (Should be FORBIDDEN)"

# ------------ ADMIN ROLE - Order Management ------------
print_subheader "ADMIN: Order Management"

api_request "GET" "/command-service/api/orders" "$ADMIN_TOKEN" "" "200" "ADMIN: Get All Orders"

api_request "GET" "/command-service/api/orders/${ORDER1_ID}" "$ADMIN_TOKEN" "" "200" "ADMIN: Get Order by ID"

api_request "GET" "/command-service/api/orders/status/CONFIRMED" "$ADMIN_TOKEN" "" "200" "ADMIN: Get Orders by Status (CONFIRMED)"

# ------------ ADMIN ROLE - Order Status Updates ------------
print_subheader "ADMIN: Order Status Workflow"

api_request "PUT" "/command-service/api/orders/${ORDER1_ID}/status?status=PROCESSING" "$ADMIN_TOKEN" "" "200" "ADMIN: Update Order 1 to PROCESSING"

api_request "PUT" "/command-service/api/orders/${ORDER1_ID}/status?status=SHIPPED" "$ADMIN_TOKEN" "" "200" "ADMIN: Update Order 1 to SHIPPED"

api_request "PUT" "/command-service/api/orders/${ORDER1_ID}/status?status=DELIVERED" "$ADMIN_TOKEN" "" "200" "ADMIN: Update Order 1 to DELIVERED"

api_request "GET" "/command-service/api/orders/status/DELIVERED" "$ADMIN_TOKEN" "" "200" "ADMIN: Get Delivered Orders"

api_request "GET" "/command-service/api/orders/status/PROCESSING" "$ADMIN_TOKEN" "" "200" "ADMIN: Get Processing Orders"

# ------------ Order Cancellation ------------
print_subheader "Order Cancellation Tests"

RESULT=$(api_request "POST" "/command-service/api/orders" "$CLIENT_TOKEN" \
    "{\"items\":[{\"productId\":\"${PRODUCT4_ID}\",\"quantity\":1}]}" \
    "201" "Create Order for Cancellation")
CANCEL_ORDER_ID=$(extract_id "$RESULT")
print_info "Order to Cancel ID: $CANCEL_ORDER_ID"

api_request_silent "DELETE" "/command-service/api/orders/${CANCEL_ORDER_ID}" "$CLIENT_TOKEN" "" "204" "CLIENT: Cancel Own Order"

api_request "GET" "/command-service/api/orders/${CANCEL_ORDER_ID}" "$CLIENT_TOKEN" "" "200" "CLIENT: Verify Cancelled Order Status"

# ============================================================
# SECURITY TESTS
# ============================================================

print_header "SECURITY TESTS"

print_subheader "Authentication Tests"

# Test without token
echo -e "${YELLOW}TEST: Access without token${NC}"
RESPONSE=$(curl -s --max-time $TIMEOUT -w "\n%{http_code}" -X GET "${GATEWAY_URL}/product-service/api/products")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
if [ "$HTTP_CODE" = "401" ]; then
    print_pass "Access without token returns 401"
else
    print_fail "Access without token (Expected: 401, Got: $HTTP_CODE)" ""
fi

# Test with invalid token
echo -e "${YELLOW}TEST: Access with invalid token${NC}"
RESPONSE=$(curl -s --max-time $TIMEOUT -w "\n%{http_code}" -X GET \
    "${GATEWAY_URL}/product-service/api/products" \
    -H "Authorization: Bearer invalid_token_here_12345")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
if [ "$HTTP_CODE" = "401" ]; then
    print_pass "Access with invalid token returns 401"
else
    print_fail "Access with invalid token (Expected: 401, Got: $HTTP_CODE)" ""
fi

# Test with expired token format
echo -e "${YELLOW}TEST: Access with malformed token${NC}"
RESPONSE=$(curl -s --max-time $TIMEOUT -w "\n%{http_code}" -X GET \
    "${GATEWAY_URL}/product-service/api/products" \
    -H "Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.invalid.signature")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
if [ "$HTTP_CODE" = "401" ]; then
    print_pass "Access with malformed token returns 401"
else
    print_fail "Access with malformed token (Expected: 401, Got: $HTTP_CODE)" ""
fi

# ============================================================
# GATEWAY TESTS
# ============================================================

print_header "GATEWAY & ACTUATOR TESTS"

print_subheader "Health Endpoints"

echo -e "${YELLOW}TEST: Gateway Health Check${NC}"
RESPONSE=$(curl -s --max-time $TIMEOUT "${GATEWAY_URL}/actuator/health")
if echo "$RESPONSE" | grep -q "UP"; then
    print_pass "Gateway actuator health returns UP"
else
    print_fail "Gateway actuator health" "$RESPONSE"
fi

echo -e "${YELLOW}TEST: Product Service Health (via Gateway)${NC}"
RESPONSE=$(curl -s --max-time $TIMEOUT "http://localhost:8081/actuator/health")
if echo "$RESPONSE" | grep -q "UP"; then
    print_pass "Product Service health returns UP"
else
    print_fail "Product Service health" "$RESPONSE"
fi

echo -e "${YELLOW}TEST: Command Service Health (via Gateway)${NC}"
RESPONSE=$(curl -s --max-time $TIMEOUT "http://localhost:8082/actuator/health")
if echo "$RESPONSE" | grep -q "UP"; then
    print_pass "Command Service health returns UP"
else
    print_fail "Command Service health" "$RESPONSE"
fi

# ============================================================
# CLEANUP
# ============================================================

print_header "Cleanup"

api_request_silent "DELETE" "/product-service/api/products/${PRODUCT5_ID}" "$ADMIN_TOKEN" "" "204" "ADMIN: Delete Product 5 (Monitor Stand)"

# ============================================================
# SUMMARY
# ============================================================

print_header "Test Summary"

echo ""
echo -e "Total Tests: ${TOTAL}"
echo -e "${GREEN}Passed: ${PASSED}${NC}"
echo -e "${RED}Failed: ${FAILED}${NC}"
echo ""

PASS_RATE=$((PASSED * 100 / TOTAL))
echo -e "Pass Rate: ${PASS_RATE}%"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}============================================================${NC}"
    echo -e "${GREEN}🎉 ALL TESTS PASSED! The API is working correctly.${NC}"
    echo -e "${GREEN}============================================================${NC}"
    exit 0
else
    echo -e "${YELLOW}============================================================${NC}"
    echo -e "${YELLOW}⚠️  Some tests failed. Please check the output above.${NC}"
    echo -e "${YELLOW}============================================================${NC}"
    exit 1
fi

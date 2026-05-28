$ErrorActionPreference = "Stop"
$loginJson = curl.exe -s -m 15 -X POST http://localhost:8000/api/v1/auth/login -H "Content-Type: application/json" --data-binary "@d:\thail-datacatalog\tmp-admin-login.json"
$login = $loginJson | ConvertFrom-Json
if (-not $login.success) { Write-Output "LOGIN_FAIL: $loginJson"; exit 1 }
$token = $login.data.access_token
$meJson = curl.exe -s -m 15 http://localhost:8000/api/v1/auth/me -H "Authorization: Bearer $token"
$me = $meJson | ConvertFrom-Json
$adminId = $me.data.id
Write-Output "=== TEST 1: Login admin OK, admin_id=$adminId ==="

$usersJson = curl.exe -s -m 15 "http://localhost:8000/api/v1/admin/users?page=1&page_size=20" -H "Authorization: Bearer $token"
$users = $usersJson | ConvertFrom-Json
$agency3 = $users.data | Where-Object { $_.email -eq 'agency3@test.com' } | Select-Object -First 1
Write-Output "=== agency3 before: id=$($agency3.id) role=$($agency3.role) ==="

$changeBody = '{"role":"agency"}'
$changeJson = curl.exe -s -m 15 -w "`nHTTP:%{http_code}" -X PATCH "http://localhost:8000/api/v1/admin/users/$($agency3.id)/role" -H "Authorization: Bearer $token" -H "Content-Type: application/json" -d $changeBody
Write-Output "=== TEST 4: Change agency3 to agency ==="
Write-Output $changeJson

$ownBody = '{"role":"agency"}'
$ownJson = curl.exe -s -m 15 -w "`nHTTP:%{http_code}" -X PATCH "http://localhost:8000/api/v1/admin/users/$adminId/role" -H "Authorization: Bearer $token" -H "Content-Type: application/json" -d $ownBody
Write-Output "=== TEST 6: Change own role (expect CANNOT_CHANGE_OWN_ROLE) ==="
Write-Output $ownJson

# Demote last admin: first ensure only one admin - agency3 might already be agency
$usersJson2 = curl.exe -s -m 15 "http://localhost:8000/api/v1/admin/users?page=1&page_size=20" -H "Authorization: Bearer $token"
$users2 = $usersJson2 | ConvertFrom-Json
$admins = $users2.data | Where-Object { $_.role -eq 'admin' }
Write-Output "=== Admins count: $($admins.Count) ==="
$soleAdmin = $admins | Where-Object { $_.id -ne $adminId } | Select-Object -First 1
if ($soleAdmin) {
  $lastJson = curl.exe -s -m 15 -w "`nHTTP:%{http_code}" -X PATCH "http://localhost:8000/api/v1/admin/users/$($soleAdmin.id)/role" -H "Authorization: Bearer $token" -H "Content-Type: application/json" -d '{"role":"agency"}'
  Write-Output "=== TEST 7: Demote other admin when 2 admins (may succeed) ==="
  Write-Output $lastJson
}
$lastJson2 = curl.exe -s -m 15 -w "`nHTTP:%{http_code}" -X PATCH "http://localhost:8000/api/v1/admin/users/$adminId/role" -H "Authorization: Bearer $token" -H "Content-Type: application/json" -d '{"role":"agency"}'
Write-Output "=== TEST 7b: Demote self as last admin attempt ==="
Write-Output $lastJson2

$dbUsers = docker exec thail-datacatalog-postgres-1 psql -U postgres -d datacatalog -c "SELECT email, role FROM users WHERE is_deleted = false;"
Write-Output "=== TEST 5: DB users ==="
Write-Output $dbUsers

$dbAudit = docker exec thail-datacatalog-postgres-1 psql -U postgres -d datacatalog -c "SELECT action, created_at FROM audit_logs ORDER BY created_at DESC LIMIT 3;"
Write-Output "=== TEST 8: Audit logs ==="
Write-Output $dbAudit

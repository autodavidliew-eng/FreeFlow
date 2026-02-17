#!/usr/bin/env bash
set -euo pipefail

KEYCLOAK_URL=${KEYCLOAK_URL:-http://localhost:8080}
REALM=${REALM:-freeflow}
ADMIN_USER=${KEYCLOAK_ADMIN:-admin}
ADMIN_PASS=${KEYCLOAK_ADMIN_PASSWORD:-admin}

KC_CMD=(sudo -S docker exec freeflow-keycloak /opt/keycloak/bin/kcadm.sh)

if [ -z "${SUDO_PASSWORD:-}" ]; then
  echo "Missing SUDO_PASSWORD env var."
  exit 1
fi

printf "%s\n" "${SUDO_PASSWORD}" | sudo -S true >/dev/null

"${KC_CMD[@]}" config credentials \
  --server "${KEYCLOAK_URL}" \
  --realm master \
  --user "${ADMIN_USER}" \
  --password "${ADMIN_PASS}" >/dev/null

for role in Admin Operator Viewer; do
  "${KC_CMD[@]}" create roles -r "${REALM}" -s name="${role}" >/dev/null 2>&1 || true
  echo "Ensured role ${role}"
done

create_user() {
  local username=$1
  local email=$2
  local password=$3
  local role=$4

  "${KC_CMD[@]}" create users -r "${REALM}" \
    -s username="${username}" \
    -s email="${email}" \
    -s enabled=true \
    -s emailVerified=true >/dev/null 2>&1 || true

  "${KC_CMD[@]}" set-password -r "${REALM}" \
    --username "${username}" \
    --new-password "${password}" \
    --temporary=false >/dev/null

  "${KC_CMD[@]}" add-roles -r "${REALM}" \
    --uusername "${username}" \
    --rolename "${role}" >/dev/null

  echo "Ensured user ${username} with role ${role}"
}

create_user "admin@freeflow.dev" "admin@freeflow.dev" "admin" "Admin"
create_user "operator@freeflow.dev" "operator@freeflow.dev" "operator" "Operator"
create_user "viewer@freeflow.dev" "viewer@freeflow.dev" "viewer" "Viewer"

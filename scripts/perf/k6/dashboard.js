import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  vus: 10,
  duration: "2m",
  thresholds: {
    http_req_failed: ["rate<0.01"],
    http_req_duration: ["p(95)<1000"],
  },
};

const BASE_URL = __ENV.BASE_URL || "http://localhost:3001";
const TOKEN = __ENV.TOKEN || "";

export default function () {
  const res = http.get(`${BASE_URL}/dashboard/layout`, {
    headers: {
      Authorization: `Bearer ${TOKEN}`,
    },
  });

  check(res, {
    "status is 200": (r) => r.status === 200,
  });

  sleep(1);
}

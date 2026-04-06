export default {
  async fetch(request) {

    const url = new URL(request.url)

    // token check
    if (url.searchParams.get("token") !== "abc123") {
      return new Response("Forbidden", { status: 403 })
    }

    // allow only Clash clients
    const ua = request.headers.get("User-Agent") || ""

    const allowedUA = [
      "Clash",
      "clash",
      "ClashMeta",
      "ClashforWindows",
      "ClashX",
      "Stash",
      "FiClash"
    ]

    let allowed = false

    for (const a of allowedUA) {
      if (ua.includes(a)) {
        allowed = true
        break
      }
    }

    if (!allowed) {
      return new Response("404 Not Found", { status: 404 })
    }

    const config = `
proxy-providers:
  myprovider:
    type: http
    url: "https://clash-worker.darkblazespuky.workers.dev/?token=abc123"
    interval: 3600
    path: ./proxies.yaml
    health-check:
      enable: true
      url: http://www.gstatic.com/generate_204
      interval: 10

proxy-groups:
- name: "FREE"
  type: select
  use:
  - myprovider

rules:
- MATCH,FREE
`

    return new Response(config, {
      headers: { "Content-Type": "text/plain" }
    })

  }
}

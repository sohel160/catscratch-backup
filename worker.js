
export default {
  async fetch(request) {
    const url = new URL(request.url);

    // ==========================================
    // SECURITY
    // ==========================================
    if (url.searchParams.get("token") !== "abc123") {
      return new Response("Forbidden", { status: 403 });
    }

    const ua = request.headers.get("User-Agent") || "";

    const allowedUA = [
      "Hiddify",
      "hiddify",
      "sing-box",
      "SingBox",
      "Clash",
      "clash",
      "okhttp",
      "Dalvik"
    ];

    if (!allowedUA.some(a => ua.includes(a))) {
      return new Response("404 Not Found", { status: 404 });
    }

    // ==========================================
    // SOCKS5 SERVER LIST
    // ==========================================
    const servers = [
      {
        tag: "proxy1",
        server: "103.178.73.1",
        port: 9169,
        username: "movip21",
        password: "movip21"
      },
      {
        tag: "proxy2",
        server: "103.146.134.225",
        port: 9169,
        username: "movip21",
        password: "movip21"
      },
      {
        tag: "proxy3",
        server: "103.118.152.36",
        port: 9169,
        username: "movip21",
        password: "movip21"
      },
      {
        tag: "proxy4",
        server: "103.111.224.46",
        port: 9169,
        username: "movip21",
        password: "movip21"
      },
      {
        tag: "proxy5",
        server: "202.5.36.149",
        port: 9169,
        username: "movieproxy",
        password: "movieproxy"
      }
    ];

    // ==========================================
    // SING-BOX OUTBOUND GENERATOR
    // ==========================================
    const outbounds = servers.map(server => ({
      type: "socks",
      tag: server.tag,
      server: server.server,
      server_port: server.port,
      version: "5",
      username: server.username,
      password: server.password,
      network: "tcp"
    }));

    // ==========================================
    // PROXY LIST ENDPOINT
    // ==========================================
    if (url.pathname === "/proxies") {
      return new Response(
        JSON.stringify({
          outbounds
        }, null, 2),
        {
          headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Cache-Control": "no-store"
          }
        }
      );
    }

    // ==========================================
    // MAIN HIDDIFY SING-BOX CONFIG
    // ==========================================
    if (url.pathname !== "/") {
      return new Response("Not Found", { status: 404 });
    }

    const config = {
      log: {
        level: "info",
        timestamp: true
      },

      dns: {
        servers: [
          {
            tag: "dns-google",
            address: "https://dns.google/dns-query",
            detour: "proxy-auto"
          },
          {
            tag: "dns-cloudflare",
            address: "https://1.1.1.1/dns-query",
            detour: "proxy-auto"
          },
          {
            tag: "dns-direct",
            address: "1.1.1.1",
            detour: "direct"
          }
        ],
        rules: [
          {
            outbound: "any",
            server: "dns-direct"
          }
        ],
        final: "dns-google",
        strategy: "ipv4_only"
      },

      inbounds: [
        {
          type: "tun",
          tag: "tun-in",
          interface_name: "singtun0",
          address: [
            "172.19.0.1/30",
            "fdfe:dcba:9876::1/126"
          ],
          mtu: 1500,
          auto_route: true,
          strict_route: true,
          stack: "mixed",
          sniff: true,
          sniff_override_destination: true
        }
      ],

      outbounds: [
        ...outbounds,

        {
          type: "urltest",
          tag: "proxy-auto",
          outbounds: servers.map(s => s.tag),
          url: "http://www.gstatic.com/generate_204",
          interval: "1m",
          tolerance: 50,
          interrupt_exist_connections: false
        },

        {
          type: "selector",
          tag: "proxy-manual",
          outbounds: [
            "proxy-auto",
            ...servers.map(s => s.tag)
          ],
          default: "proxy-auto",
          interrupt_exist_connections: false
        },

        {
          type: "direct",
          tag: "direct"
        },

        {
          type: "block",
          tag: "block"
        }
      ],

      route: {
        auto_detect_interface: true,
        final: "proxy-manual",

        rules: [
          {
            protocol: "dns",
            action: "hijack-dns"
          },
          {
            ip_is_private: true,
            outbound: "direct"
          },
          {
            geoip: ["bd"],
            outbound: "direct"
          }
        ]
      },

      experimental: {
        cache_file: {
          enabled: true,
          path: "cache.db"
        }
      }
    };

    return new Response(JSON.stringify(config, null, 2), {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store"
      }
    });
  }
};


module.exports = {
  apps: [
    {
      name: "blog-backend",
      script: "/root/projects/micro-ai-blog/backend/venv/bin/uvicorn",
      args: "app.main:app --host 127.0.0.1 --port 8001",
      cwd: "/root/projects/micro-ai-blog/backend",
      interpreter: "/root/projects/micro-ai-blog/backend/venv/bin/python3",
      instances: 1,
      autorestart: true,
      max_restarts: 5,
      restart_delay: 5000,
      max_memory_restart: "256M",
      env: {
        PYTHONUNBUFFERED: "1",
      },
    },
    {
      name: "blog-frontend",
      script: "/usr/bin/npm",
      args: "run start",
      cwd: "/root/projects/micro-ai-blog/frontend",
      interpreter: "/usr/bin/node-22",
      instances: 1,
      autorestart: true,
      max_restarts: 5,
      restart_delay: 5000,
      max_memory_restart: "384M",
      env: {
        NODE_ENV: "production",
        PORT: "3000",
      },
    },
  ],
};

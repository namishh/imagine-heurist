# .platform/hooks/predepluy/01_install_dependencies.sh
#!/bin/bash
cd /var/app/staging

# Install pnpm
npm install -g pnpm

# Install dependencies and build
pnpm install
pnpm build
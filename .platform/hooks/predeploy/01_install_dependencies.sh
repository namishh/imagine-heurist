#!/bin/bash
set -xe

cd /var/app/staging

# Install pnpm
npm install -g pnpm

# Install dependencies and build
pnpm install
pnpm build
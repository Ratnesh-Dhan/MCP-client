#!/bin/bash
echo "Starting Backend..."
(cd mcp-client-be && pnpm dev) &
echo "Starting Frontend..."
(cd mcp-client-fe && pnpm dev) &
wait

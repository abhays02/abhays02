FROM node:24-bookworm-slim
WORKDIR /app
ENV NODE_ENV=production HOST=0.0.0.0 PORT=4173
COPY --chown=node:node package.json ./
COPY --chown=node:node server/ ./server/
COPY --chown=node:node content/ ./content/
COPY --chown=node:node dist/ ./dist/
USER node
EXPOSE 4173
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s CMD node -e "fetch('http://127.0.0.1:'+process.env.PORT+'/api/status').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"
CMD ["node", "server/server.mjs"]

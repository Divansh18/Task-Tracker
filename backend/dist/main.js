"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_crypto_1 = require("node:crypto");
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
if (typeof globalThis.crypto === 'undefined') {
    globalThis
        .crypto = { randomUUID: node_crypto_1.randomUUID };
}
else if (typeof globalThis.crypto.randomUUID !== 'function') {
    globalThis.crypto.randomUUID =
        node_crypto_1.randomUUID;
}
async function bootstrap() {
    const { AppModule } = await Promise.resolve().then(() => require('./app.module'));
    const app = await core_1.NestFactory.create(AppModule);
    app.enableCors({
        origin: process.env.FRONTEND_ORIGIN?.split(',') ?? true,
        credentials: true,
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
    }));
    const port = process.env.PORT ? Number(process.env.PORT) : 3000;
    await app.listen(port);
    console.log(`🚀 Backend listening on http://localhost:${port}`);
}
bootstrap();
//# sourceMappingURL=main.js.map
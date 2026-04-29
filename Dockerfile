# ── Stage 1: Build ────────────────────────────────────────────────────────────
FROM maven:3.9.6-eclipse-temurin-17-alpine AS builder
WORKDIR /app

# Cache de dependências (só rebaixa se pom.xml mudar)
COPY pom.xml .
RUN mvn dependency:go-offline -q

# Build da aplicação
COPY src ./src
RUN mvn clean package -DskipTests -q

# ── Stage 2: Runtime ──────────────────────────────────────────────────────────
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Usuário não-root para segurança
RUN addgroup -S ecommerce && adduser -S ecommerce -G ecommerce
USER ecommerce

COPY --from=builder /app/target/ecommerce-platform-*.jar app.jar

EXPOSE 8080

ENV JAVA_OPTS="-Xmx512m -Xms256m -XX:+UseG1GC"

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]

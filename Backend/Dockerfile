# STAGE 1: BUILD (Maven + JDK 21) 
FROM eclipse-temurin:21-jdk AS builder

WORKDIR /app

COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .

# Baixa dependências para cache
RUN ./mvnw -q -ntp -DskipTests dependency:go-offline

# Copia o código-fonte
COPY src ./src

# Builda o .jar final
RUN ./mvnw -q -ntp -DskipTests package


# STAGE 2: RUNTIME (JRE 21)
FROM eclipse-temurin:21-jre

WORKDIR /app

COPY --from=builder /app/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]

import swaggerAutogen from "swagger-autogen";

const doc = {
    info: {
        version: "v0.0.1",
        title: "Dokumentasi Al-Badar Digital",
        description: "Dokumentasi Al-Badar Digital"
    },
    servers: [
        {
            url: "http://localhost:3000/api",
            description: "Local Server"
        },
        {
            url: "https://backend-albadar-digital.vercel.app/api",
            description: "Deploy Server"
        }
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: "http",
                scheme: "bearer"
            }
        },
        schemas: {
            LoginRequest: {
                username: "ahmadsabani",
                password: "ahmad1234"
            }
        }
    }
};

const outputFile = "./swagger_output.json";
const endpointsFiles = ["../routes/api.ts"];


swaggerAutogen({ openapi: "3.0.0" })(outputFile, endpointsFiles, doc);
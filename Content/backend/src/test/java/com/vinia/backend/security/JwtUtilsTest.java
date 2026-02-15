package com.vinia.backend.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for JwtUtils.
 * 
 * Covers JWT token generation, validation, and
 * username extraction from tokens.
 */
class JwtUtilsTest {

    private JwtUtils jwtUtils;

    @BeforeEach
    void setUp() {
        jwtUtils = new JwtUtils();
    }

    @Nested
    @DisplayName("generateTokenFromUsername()")
    class GenerateToken {
        @Test
        @DisplayName("Debe generar token no nulo")
        void debeGenerarTokenNoNulo() {
            String token = jwtUtils.generateTokenFromUsername("testuser");

            assertNotNull(token);
            assertFalse(token.isEmpty());
        }

        @Test
        @DisplayName("Tokens diferentes para usuarios diferentes")
        void tokensDiferentesParaUsuariosDiferentes() {
            String token1 = jwtUtils.generateTokenFromUsername("user1");
            String token2 = jwtUtils.generateTokenFromUsername("user2");

            assertNotEquals(token1, token2);
        }
    }

    @Nested
    @DisplayName("getUserNameFromJwtToken()")
    class GetUsername {
        @Test
        @DisplayName("Debe extraer username del token")
        void debeExtraerUsernameDelToken() {
            String token = jwtUtils.generateTokenFromUsername("carlos");

            String username = jwtUtils.getUserNameFromJwtToken(token);

            assertEquals("carlos", username);
        }
    }

    @Nested
    @DisplayName("validateJwtToken()")
    class ValidateToken {
        @Test
        @DisplayName("Debe validar token correcto")
        void debeValidarTokenCorrecto() {
            String token = jwtUtils.generateTokenFromUsername("admin");

            assertTrue(jwtUtils.validateJwtToken(token));
        }

        @Test
        @DisplayName("Debe rechazar token inválido")
        void debeRechazarTokenInvalido() {
            assertFalse(jwtUtils.validateJwtToken("token.invalido.aqui"));
        }

        @Test
        @DisplayName("Debe rechazar token con formato incorrecto")
        void debeRechazarTokenFormatoIncorrecto() {
            assertFalse(jwtUtils.validateJwtToken("not.a.valid.jwt.token.structure"));
        }

        @Test
        @DisplayName("Debe rechazar token manipulado")
        void debeRechazarTokenManipulado() {
            String token = jwtUtils.generateTokenFromUsername("admin");
            String tampered = token.substring(0, token.length() - 5) + "XXXXX";

            assertFalse(jwtUtils.validateJwtToken(tampered));
        }
    }
}

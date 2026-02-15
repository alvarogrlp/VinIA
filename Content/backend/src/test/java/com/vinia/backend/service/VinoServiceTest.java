package com.vinia.backend.service;

import com.vinia.backend.model.Vino;
import com.vinia.backend.repository.VinoRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for VinoService.
 * 
 * Covers CRUD operations, search functionality, stock management,
 * and edge cases for the wine catalog service.
 */
@ExtendWith(MockitoExtension.class)
class VinoServiceTest {

    @Mock
    private VinoRepository vinoRepository;

    @Mock
    private AuditService auditService;

    @InjectMocks
    private VinoService vinoService;

    private Vino vinoTinto;
    private Vino vinoBlanco;

    @BeforeEach
    void setUp() {
        vinoTinto = new Vino();
        vinoTinto.setId("v1");
        vinoTinto.setNombre("Rioja Reserva");
        vinoTinto.setBodega("Bodegas Torres");
        vinoTinto.setTipo("Tinto");
        vinoTinto.setAno(2018);
        vinoTinto.setPrecio(new BigDecimal("25.50"));
        vinoTinto.setDenominacionOrigen("Rioja");
        vinoTinto.setGradoAlcohol(new BigDecimal("14.00"));
        vinoTinto.setStock(100);
        vinoTinto.setStockMinimo(10);
        vinoTinto.setVariedadUva("Tempranillo");
        vinoTinto.setAroma("Frutas rojas, vainilla");
        vinoTinto.setSabor("Roble, cereza");

        vinoBlanco = new Vino();
        vinoBlanco.setId("v2");
        vinoBlanco.setNombre("Albariño Premium");
        vinoBlanco.setBodega("Martín Códax");
        vinoBlanco.setTipo("Blanco");
        vinoBlanco.setAno(2022);
        vinoBlanco.setPrecio(new BigDecimal("18.00"));
        vinoBlanco.setDenominacionOrigen("Rías Baixas");
        vinoBlanco.setGradoAlcohol(new BigDecimal("12.50"));
        vinoBlanco.setStock(50);
        vinoBlanco.setStockMinimo(5);
    }

    @Nested
    @DisplayName("findAll()")
    class FindAll {
        @Test
        @DisplayName("Debe devolver todos los vinos")
        void debeRetornarTodosLosVinos() {
            when(vinoRepository.findAll()).thenReturn(Arrays.asList(vinoTinto, vinoBlanco));

            List<Vino> result = vinoService.findAll();

            assertEquals(2, result.size());
            verify(vinoRepository).findAll();
        }

        @Test
        @DisplayName("Debe devolver lista vacía si no hay vinos")
        void debeRetornarListaVacia() {
            when(vinoRepository.findAll()).thenReturn(Collections.emptyList());

            List<Vino> result = vinoService.findAll();

            assertTrue(result.isEmpty());
        }
    }

    @Nested
    @DisplayName("findById()")
    class FindById {
        @Test
        @DisplayName("Debe encontrar un vino por su ID")
        void debeEncontrarVinoPorId() {
            when(vinoRepository.findById("v1")).thenReturn(Optional.of(vinoTinto));

            Vino result = vinoService.findById("v1");

            assertNotNull(result);
            assertEquals("Rioja Reserva", result.getNombre());
        }

        @Test
        @DisplayName("Debe lanzar excepción si el vino no existe")
        void debeLanzarExcepcionSiNoExiste() {
            when(vinoRepository.findById("inexistente")).thenReturn(Optional.empty());

            RuntimeException ex = assertThrows(RuntimeException.class,
                    () -> vinoService.findById("inexistente"));
            assertEquals("Vino no encontrado", ex.getMessage());
        }
    }

    @Nested
    @DisplayName("save()")
    class Save {
        @Test
        @DisplayName("Debe guardar un vino y registrar auditoría")
        void debeGuardarVinoConAuditoria() {
            when(vinoRepository.save(any(Vino.class))).thenReturn(vinoTinto);

            Vino result = vinoService.save(vinoTinto);

            assertNotNull(result);
            assertEquals("v1", result.getId());
            verify(vinoRepository).save(vinoTinto);
            verify(auditService).log(anyString(), eq("SAVE"), eq("Vino"), eq("v1"), contains("Rioja Reserva"));
        }
    }

    @Nested
    @DisplayName("deleteById()")
    class DeleteById {
        @Test
        @DisplayName("Debe eliminar un vino y registrar auditoría")
        void debeEliminarVinoConAuditoria() {
            doNothing().when(vinoRepository).deleteById("v1");

            vinoService.deleteById("v1");

            verify(vinoRepository).deleteById("v1");
            verify(auditService).log(anyString(), eq("DELETE"), eq("Vino"), eq("v1"), isNull());
        }
    }

    @Nested
    @DisplayName("search()")
    class Search {
        @Test
        @DisplayName("Debe devolver todos si la query es vacía")
        void debeRetornarTodosSiQueryVacia() {
            when(vinoRepository.findAll()).thenReturn(Arrays.asList(vinoTinto, vinoBlanco));

            List<Vino> result = vinoService.search("");

            assertEquals(2, result.size());
        }

        @Test
        @DisplayName("Debe devolver todos si la query es null")
        void debeRetornarTodosSiQueryNull() {
            when(vinoRepository.findAll()).thenReturn(Arrays.asList(vinoTinto, vinoBlanco));

            List<Vino> result = vinoService.search(null);

            assertEquals(2, result.size());
        }

        @Test
        @DisplayName("Debe encontrar vino por nombre")
        void debeEncontrarPorNombre() {
            when(vinoRepository.findAll()).thenReturn(Arrays.asList(vinoTinto, vinoBlanco));

            List<Vino> result = vinoService.search("rioja");

            assertEquals(1, result.size());
            assertEquals("Rioja Reserva", result.get(0).getNombre());
        }

        @Test
        @DisplayName("Debe encontrar vino por bodega")
        void debeEncontrarPorBodega() {
            when(vinoRepository.findAll()).thenReturn(Arrays.asList(vinoTinto, vinoBlanco));

            List<Vino> result = vinoService.search("torres");

            assertEquals(1, result.size());
            assertEquals("Bodegas Torres", result.get(0).getBodega());
        }

        @Test
        @DisplayName("Debe encontrar vino por tipo")
        void debeEncontrarPorTipo() {
            when(vinoRepository.findAll()).thenReturn(Arrays.asList(vinoTinto, vinoBlanco));

            List<Vino> result = vinoService.search("blanco");

            assertEquals(1, result.size());
            assertEquals("Blanco", result.get(0).getTipo());
        }

        @Test
        @DisplayName("Debe soportar búsqueda multi-término (AND)")
        void debeSoportarBusquedaMultiTermino() {
            when(vinoRepository.findAll()).thenReturn(Arrays.asList(vinoTinto, vinoBlanco));

            List<Vino> result = vinoService.search("tinto rioja");

            assertEquals(1, result.size());
            assertEquals("Rioja Reserva", result.get(0).getNombre());
        }

        @Test
        @DisplayName("Debe devolver vacío si no hay coincidencias")
        void debeRetornarVacioSinResultados() {
            when(vinoRepository.findAll()).thenReturn(Arrays.asList(vinoTinto, vinoBlanco));

            List<Vino> result = vinoService.search("champagne");

            assertTrue(result.isEmpty());
        }

        @Test
        @DisplayName("Debe encontrar por año")
        void debeEncontrarPorAno() {
            when(vinoRepository.findAll()).thenReturn(Arrays.asList(vinoTinto, vinoBlanco));

            List<Vino> result = vinoService.search("2022");

            assertEquals(1, result.size());
            assertEquals("Albariño Premium", result.get(0).getNombre());
        }
    }

    @Nested
    @DisplayName("findLowStock()")
    class FindLowStock {
        @Test
        @DisplayName("Debe encontrar vinos con stock bajo")
        void debeEncontrarVinosConStockBajo() {
            vinoBlanco.setStock(3);
            when(vinoRepository.findByStockLessThan(10)).thenReturn(List.of(vinoBlanco));

            List<Vino> result = vinoService.findLowStock(10);

            assertEquals(1, result.size());
            assertEquals("Albariño Premium", result.get(0).getNombre());
        }
    }

    @Nested
    @DisplayName("updateStock()")
    class UpdateStock {
        @Test
        @DisplayName("Debe actualizar stock y registrar auditoría")
        void debeActualizarStockConAuditoria() {
            when(vinoRepository.findById("v1")).thenReturn(Optional.of(vinoTinto));
            when(vinoRepository.save(any(Vino.class))).thenReturn(vinoTinto);

            Vino result = vinoService.updateStock("v1", 200);

            assertEquals(200, result.getStock());
            verify(auditService).log(anyString(), eq("UPDATE_STOCK"), eq("Vino"), eq("v1"), contains("Old: 100"));
        }

        @Test
        @DisplayName("Debe lanzar excepción si vino no existe al actualizar stock")
        void debeLanzarExcepcionSiNoExisteAlActualizarStock() {
            when(vinoRepository.findById("inexistente")).thenReturn(Optional.empty());

            assertThrows(RuntimeException.class,
                    () -> vinoService.updateStock("inexistente", 50));
        }
    }
}

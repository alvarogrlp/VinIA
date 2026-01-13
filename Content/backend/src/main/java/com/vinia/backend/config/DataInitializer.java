package com.vinia.backend.config;

import com.vinia.backend.model.Usuario;
import com.vinia.backend.repository.UsuarioRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initData(UsuarioRepository usuarioRepository, com.vinia.backend.repository.VinoRepository vinoRepository) {
        return args -> {
            // Check if admin exists
            if (usuarioRepository.findByUsername("admin").isEmpty()) {
                Usuario admin = new Usuario();
                admin.setUsername("admin");
                admin.setPassword("admin");
                admin.setNombre("Administrador");
                admin.setApellidos("Sistema");
                admin.setRol("Administración");
                admin.setActivo(true);
                usuarioRepository.save(admin);
                System.out.println("Admin user created: admin/admin");
            }

            // Check if comercial exists
            if (usuarioRepository.findByUsername("comercial").isEmpty()) {
                Usuario comercial = new Usuario();
                comercial.setUsername("comercial");
                comercial.setPassword("comercial");
                comercial.setNombre("Juan");
                comercial.setApellidos("Comercial");
                comercial.setRol("Comercial");
                comercial.setActivo(true);
                usuarioRepository.save(comercial);
                System.out.println("Comercial user created: comercial/comercial");
            }
            // Check if almacen exists
            if (usuarioRepository.findByUsername("almacen").isEmpty()) {
                Usuario almacen = new Usuario();
                almacen.setUsername("almacen");
                almacen.setPassword("almacen");
                almacen.setNombre("Pedro");
                almacen.setApellidos("Almacen");
                almacen.setRol("Almacén");
                almacen.setActivo(true);
                usuarioRepository.save(almacen);
                System.out.println("Almacen user created: almacen/almacen");
            }

            // Check if repartidor exists
            if (usuarioRepository.findByUsername("repartidor").isEmpty()) {
                Usuario repartidor = new Usuario();
                repartidor.setUsername("repartidor");
                repartidor.setPassword("repartidor");
                repartidor.setNombre("Luis");
                repartidor.setApellidos("Repartidor");
                repartidor.setRol("Repartidor");
                repartidor.setActivo(true);
                usuarioRepository.save(repartidor);
                System.out.println("Repartidor user created: repartidor/repartidor");
            }
            
            // Seed initial wine if empty to avoid 404s on fresh start
            if (vinoRepository.count() == 0) {
                 com.vinia.backend.model.Vino vino = new com.vinia.backend.model.Vino();
                 vino.setId("v1000000-0000-0000-0000-000000000001");
                 vino.setNombre("Vino Tinto Reserva");
                 vino.setBodega("Bodegas VinIA");
                 vino.setTipo("Tinto");
                 vino.setAno(2020);
                 vino.setPrecio(new java.math.BigDecimal("15.50"));
                 vino.setDenominacionOrigen("Rioja");
                 vino.setGradoAlcohol(new java.math.BigDecimal("13.5"));
                 vino.setStock(100);
                 vino.setStockMinimo(10);
                 vino.setDescripcion("Vino tinto reserva con notas de roble.");
                 vinoRepository.save(vino);
                 System.out.println("Seeded initial wine: " + vino.getNombre());
            }
        };
    }
}

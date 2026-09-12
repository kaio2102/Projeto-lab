package com.facilitalab.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.http.HttpMethod;

import com.facilitalab.service.UsuarioService;

@EnableWebSecurity
@Configuration
public class SecurityConfig {

        private final JwtUtil jwtUtil;
        private final UsuarioService usuarioService;

        public SecurityConfig(JwtUtil jwtUtil, @Lazy UsuarioService usuarioService) {
                this.jwtUtil = jwtUtil;
                this.usuarioService = usuarioService;
        }

        @Bean
        public JwtFilter jwtFilter() {
                return new JwtFilter(jwtUtil, usuarioService);
        }

        @Bean
        public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
                http
                                .csrf(csrf -> csrf.disable())
                                .httpBasic(basic -> basic.disable())
                                .formLogin(form -> form.disable())
                                .authorizeHttpRequests(auth -> auth

                                                // Estaticos e auth
                                                .requestMatchers("/auth/**", "/css/**", "/js/**", "/images/**",
                                                                "/fragments/**", "/*.html",
                                                                "/favicon.ico",
                                                                "/", "/error")
                                                .permitAll()

                                                // navegação
                                                .requestMatchers(
                                                                "/login",
                                                                "/redefinir-senha",
                                                                "/dashboard",
                                                                "/cadastro-usuario",
                                                                "/lista-usuarios",
                                                                "/editar-usuario/{id}",
                                                                "/cadastro-pedido",
                                                                "/lista-pedidos",
                                                                "/editar-pedido/{id}",
                                                                "/novo-pedido",
                                                                "/triagem-pedido",
                                                                "/dashboard-dentista",
                                                                "/meus-pedidos",
                                                                "/dashboard-recepcao",
                                                                "/lista-pedidos-recepcao")
                                                .permitAll()

                                                // Rotas de api Pedidos
                                                .requestMatchers(HttpMethod.POST, "/pedidos").hasRole("DENTISTA")
                                                .requestMatchers(HttpMethod.GET, "/pedidos/dentista/{id}")
                                                .hasRole("DENTISTA")
                                                .requestMatchers(HttpMethod.GET, "/pedidos/id/{id}")
                                                .hasAnyRole("DENTISTA", "RECEPCAO", "CADISTA", "GESTOR")
                                                .requestMatchers(HttpMethod.GET, "/pedidos/prioridade")
                                                .hasAnyRole("RECEPCAO", "GESTOR")
                                                .requestMatchers(HttpMethod.GET, "/pedidos/cadista/{id}")
                                                .hasAnyRole("CADISTA", "GESTOR")
                                                .requestMatchers(HttpMethod.GET, "/pedidos/estado")
                                                .hasAnyRole("RECEPCAO", "CADISTA", "GESTOR")
                                                .requestMatchers(HttpMethod.GET, "/pedidos")
                                                .hasAnyRole("RECEPCAO", "CADISTA", "GESTOR")
                                                .requestMatchers(HttpMethod.PUT, "/pedidos/{id}/estado")
                                                .hasAnyRole("RECEPCAO", "CADISTA", "GESTOR")
                                                .requestMatchers(HttpMethod.PUT, "/pedidos/{id}")
                                                .hasAnyRole("RECEPCAO", "CADISTA", "GESTOR", "DENTISTA")
                                                .requestMatchers(HttpMethod.DELETE, "/pedidos/{id}")
                                                .hasAnyRole("GESTOR", "RECEPCAO")

                                                // Rota de api Usuarios
                                                .requestMatchers(HttpMethod.POST, "/usuarios")
                                                .hasAnyRole("GESTOR", "RECEPCAO")
                                                .requestMatchers(HttpMethod.GET, "/usuarios/perfil/{perfil}")
                                                .hasAnyRole("GESTOR", "RECEPCAO", "DENTISTA")
                                                .requestMatchers(HttpMethod.GET, "/usuarios/{id}")
                                                .hasAnyRole("GESTOR", "RECEPCAO")
                                                .requestMatchers(HttpMethod.GET, "/usuarios/email/{email}")
                                                .hasAnyRole("GESTOR", "RECEPCAO")
                                                .requestMatchers(HttpMethod.GET, "/usuarios")
                                                .hasAnyRole("GESTOR", "RECEPCAO")
                                                .requestMatchers(HttpMethod.PUT, "/usuarios/{id}")
                                                .hasAnyRole("GESTOR", "RECEPCAO")
                                                .requestMatchers(HttpMethod.DELETE, "/usuarios/{id}").hasRole("GESTOR")
                                                // backstop pega tudo que n se encaixou nas regras de cima
                                                .anyRequest().authenticated())
                                .addFilterBefore(jwtFilter(), UsernamePasswordAuthenticationFilter.class);

                return http.build();
        }
}

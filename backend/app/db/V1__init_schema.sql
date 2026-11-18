CREATE TABLE entidades (
    id BIGINT PRIMARY KEY,
    nombre_entidad VARCHAR(255) NOT NULL,
    nit INT NOT NULL UNIQUE
);

CREATE TABLE contratistas (
    id BIGINT PRIMARY KEY,
    documento_id INT NOT NULL UNIQUE, 
    nombre_razon_social VARCHAR(255) NOT NULL, 
    tipo_persona VARCHAR(255)
);

CREATE TABLE comunas (
    id BIGINT PRIMARY KEY,
    numero_comuna INT
);

CREATE TABLE contratos (
    id BIGINT PRIMARY KEY,
    numero_proceso INT NOT NULL, 
    objeto_contrato VARCHAR(255), 
    cuantia_inicial FLOAT, 
    cuantia_final FLOAT,
    fecha_firma DATE, 
    fecha_inicio DATE, 
    fecha_fin DATE, 
    modalidad_seleccion VARCHAR(255)
    id_entidad BIGINT REFERENCES entidades(id), 
    id_contratista BIGINT REFERENCES contratistas(id), 
    id_comuna BIGINT REFERENCES comunas(id)
);

CREATE TABLE adiciones_prorogas (
    id BIGINT PRIMARY, 
    id_contrato BIGINT REFERENCES contratos(id) ON DELETE CASCADE, 
    valor_adicionado FLOAT, 
    dias_prorroga FLOAT
); 

CREATE TABLE banderas_rojas (
    id BIGINT PRIMARY KEY, 
    id_contrato BIGINT REFERENCES contratos(id), 
    tipo_alerta VARCHAR(255), 
    nivel_riesgo VARCHAR(255), 
    descripcion VARCHAR(255)
);
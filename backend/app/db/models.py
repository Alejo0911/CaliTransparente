from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.db.session import Base


class EntidadModel(Base):
    __tablename__ = "entidades"

    nit = Column(String(20), primary_key=True, index=True)
    nombre = Column(String(255), nullable=False)
    tipo = Column(String(100), default="Municipal")

    contratos = relationship("ContratoModel", back_populates="entidad", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Entidad {self.nit} - {self.nombre}>"


class ComunaModel(Base):
    __tablename__ = "comunas"

    id_comuna = Column(String(20), primary_key=True, index=True)  # Ej: "1", "2", "rural-norte"
    nombre = Column(String(100), nullable=False)
    tipo = Column(String(50), default="urbana")  # "urbana" o "rural"
    lat = Column(Float, nullable=True)
    lng = Column(Float, nullable=True)

    contratos = relationship("ContratoModel", back_populates="comuna")

    def __repr__(self):
        return f"<Comuna {self.id_comuna} - {self.nombre}>"


class ContratoModel(Base):
    __tablename__ = "contratos"

    id_contrato = Column(String(100), primary_key=True, index=True)  # Ej: "CO1.PCCNTR.840227"
    numero_proceso = Column(String(100), index=True, nullable=True)
    objeto_contrato = Column(Text, nullable=False)
    cuantia = Column(Float, default=0.0)
    fecha_firma = Column(DateTime, nullable=True)
    modalidad = Column(String(150), index=True, nullable=True)
    estado = Column(String(100), index=True, nullable=True)

    # Proveedor / Contratista
    contratista_nombre = Column(String(255), nullable=True)
    contratista_nit = Column(String(50), index=True, nullable=True)
    url_proceso = Column(Text, nullable=True)

    # Llaves foráneas
    nit_entidad = Column(String(20), ForeignKey("entidades.nit"), nullable=False)
    id_comuna = Column(String(20), ForeignKey("comunas.id_comuna"), nullable=True)

    # Relaciones
    entidad = relationship("EntidadModel", back_populates="contratos")
    comuna = relationship("ComunaModel", back_populates="contratos")

    def __repr__(self):
        return f"<Contrato {self.id_contrato} - {self.cuantia} COP>"

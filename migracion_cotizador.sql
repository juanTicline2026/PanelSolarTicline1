--
-- PostgreSQL database dump
--

\restrict Y5oRFwDmdIoiX2cFfFkdUoFkKIVFRWtHBWg0LrteZL3IJhS3zrn4QzmTFJIaaSP

-- Dumped from database version 18.6
-- Dumped by pg_dump version 18.6

-- Started on 2026-11-12 11:17:36

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 7 (class 2615 OID 16388)
-- Name: pgagent; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA pgagent;


ALTER SCHEMA pgagent OWNER TO postgres;

--
-- TOC entry 5201 (class 0 OID 0)
-- Dependencies: 7
-- Name: SCHEMA pgagent; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA pgagent IS 'pgAgent system tables';


--
-- TOC entry 2 (class 3079 OID 16389)
-- Name: pgagent; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgagent WITH SCHEMA pgagent;


--
-- TOC entry 5202 (class 0 OID 0)
-- Dependencies: 2
-- Name: EXTENSION pgagent; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgagent IS 'A PostgreSQL job scheduler';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 247 (class 1259 OID 16703)
-- Name: costos_vatio; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.costos_vatio (
    id integer NOT NULL,
    wp_minimo integer NOT NULL,
    costo_usd_vatio numeric(10,4) NOT NULL,
    celda_excel character varying(50) DEFAULT 'Bases de Datos!L5:M36'::character varying
);


ALTER TABLE public.costos_vatio OWNER TO postgres;

--
-- TOC entry 246 (class 1259 OID 16702)
-- Name: costos_vatio_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.costos_vatio_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.costos_vatio_id_seq OWNER TO postgres;

--
-- TOC entry 5203 (class 0 OID 0)
-- Dependencies: 246
-- Name: costos_vatio_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.costos_vatio_id_seq OWNED BY public.costos_vatio.id;


--
-- TOC entry 243 (class 1259 OID 16615)
-- Name: cotizaciones; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cotizaciones (
    id integer NOT NULL,
    cliente character varying(200) NOT NULL,
    proyecto character varying(200) NOT NULL,
    ciudad character varying(120) NOT NULL,
    departamento character varying(120) NOT NULL,
    consumo_kwh numeric(12,2) DEFAULT 0 NOT NULL,
    paneles integer DEFAULT 0 NOT NULL,
    kwp numeric(10,2) DEFAULT 0 NOT NULL,
    inversion_cop numeric(16,2) DEFAULT 0 NOT NULL,
    ahorro_mensual_cop numeric(16,2) DEFAULT 0 NOT NULL,
    creado_por character varying(150),
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    usuario_id integer,
    usuario_nombre character varying(150),
    potencia_panel_w integer,
    radiacion_hsp numeric(8,2),
    trm numeric(12,2),
    area_requerida_m2 numeric(10,2),
    produccion_mensual_kwh numeric(12,2),
    retorno_anios numeric(6,2),
    tir_pct numeric(8,4),
    ahorro_co2_ton numeric(10,2),
    datos_cotizacion jsonb
);


ALTER TABLE public.cotizaciones OWNER TO postgres;

--
-- TOC entry 242 (class 1259 OID 16614)
-- Name: cotizaciones_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.cotizaciones_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.cotizaciones_id_seq OWNER TO postgres;

--
-- TOC entry 5204 (class 0 OID 0)
-- Dependencies: 242
-- Name: cotizaciones_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.cotizaciones_id_seq OWNED BY public.cotizaciones.id;


--
-- TOC entry 245 (class 1259 OID 16684)
-- Name: formulas_sistema; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.formulas_sistema (
    id integer NOT NULL,
    codigo character varying(80) NOT NULL,
    nombre character varying(160) NOT NULL,
    expresion_formula text NOT NULL,
    valor_numerico numeric(14,6) DEFAULT 0 NOT NULL,
    unidad character varying(50) NOT NULL,
    celda_excel character varying(60),
    descripcion text,
    fecha_actualizacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.formulas_sistema OWNER TO postgres;

--
-- TOC entry 244 (class 1259 OID 16683)
-- Name: formulas_sistema_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.formulas_sistema_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.formulas_sistema_id_seq OWNER TO postgres;

--
-- TOC entry 5205 (class 0 OID 0)
-- Dependencies: 244
-- Name: formulas_sistema_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.formulas_sistema_id_seq OWNED BY public.formulas_sistema.id;


--
-- TOC entry 249 (class 1259 OID 16716)
-- Name: radiacion_departamentos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.radiacion_departamentos (
    id integer NOT NULL,
    departamento character varying(100) NOT NULL,
    hsp_promedio numeric(10,4) NOT NULL,
    hsp_minimo numeric(10,4) NOT NULL,
    hsp_maximo numeric(10,4) NOT NULL
);


ALTER TABLE public.radiacion_departamentos OWNER TO postgres;

--
-- TOC entry 248 (class 1259 OID 16715)
-- Name: radiacion_departamentos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.radiacion_departamentos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.radiacion_departamentos_id_seq OWNER TO postgres;

--
-- TOC entry 5206 (class 0 OID 0)
-- Dependencies: 248
-- Name: radiacion_departamentos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.radiacion_departamentos_id_seq OWNED BY public.radiacion_departamentos.id;


--
-- TOC entry 251 (class 1259 OID 16735)
-- Name: sesiones_jwt; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sesiones_jwt (
    id integer NOT NULL,
    usuario_id integer,
    email character varying(150) NOT NULL,
    token_jwt text NOT NULL,
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    fecha_expiracion timestamp without time zone NOT NULL,
    activo boolean DEFAULT true
);


ALTER TABLE public.sesiones_jwt OWNER TO postgres;

--
-- TOC entry 250 (class 1259 OID 16734)
-- Name: sesiones_jwt_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.sesiones_jwt_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sesiones_jwt_id_seq OWNER TO postgres;

--
-- TOC entry 5207 (class 0 OID 0)
-- Dependencies: 250
-- Name: sesiones_jwt_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.sesiones_jwt_id_seq OWNED BY public.sesiones_jwt.id;


--
-- TOC entry 241 (class 1259 OID 16598)
-- Name: usuarios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.usuarios (
    id integer NOT NULL,
    email character varying(150) NOT NULL,
    password_hash character varying(255) NOT NULL,
    nombre character varying(150) NOT NULL,
    rol character varying(80) DEFAULT 'Ingeniero de Proyectos'::character varying,
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    token_jwt text,
    ultimo_login timestamp without time zone
);


ALTER TABLE public.usuarios OWNER TO postgres;

--
-- TOC entry 240 (class 1259 OID 16597)
-- Name: usuarios_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.usuarios_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.usuarios_id_seq OWNER TO postgres;

--
-- TOC entry 5208 (class 0 OID 0)
-- Dependencies: 240
-- Name: usuarios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.usuarios_id_seq OWNED BY public.usuarios.id;


--
-- TOC entry 4975 (class 2604 OID 16706)
-- Name: costos_vatio id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.costos_vatio ALTER COLUMN id SET DEFAULT nextval('public.costos_vatio_id_seq'::regclass);


--
-- TOC entry 4965 (class 2604 OID 16618)
-- Name: cotizaciones id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cotizaciones ALTER COLUMN id SET DEFAULT nextval('public.cotizaciones_id_seq'::regclass);


--
-- TOC entry 4972 (class 2604 OID 16687)
-- Name: formulas_sistema id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.formulas_sistema ALTER COLUMN id SET DEFAULT nextval('public.formulas_sistema_id_seq'::regclass);


--
-- TOC entry 4977 (class 2604 OID 16719)
-- Name: radiacion_departamentos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.radiacion_departamentos ALTER COLUMN id SET DEFAULT nextval('public.radiacion_departamentos_id_seq'::regclass);


--
-- TOC entry 4978 (class 2604 OID 16738)
-- Name: sesiones_jwt id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sesiones_jwt ALTER COLUMN id SET DEFAULT nextval('public.sesiones_jwt_id_seq'::regclass);


--
-- TOC entry 4962 (class 2604 OID 16601)
-- Name: usuarios id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios ALTER COLUMN id SET DEFAULT nextval('public.usuarios_id_seq'::regclass);


--
-- TOC entry 4924 (class 0 OID 16390)
-- Dependencies: 225
-- Data for Name: pga_jobagent; Type: TABLE DATA; Schema: pgagent; Owner: postgres
--

COPY pgagent.pga_jobagent (jagpid, jaglogintime, jagstation) FROM stdin;
8476	2026-11-11 07:30:13.775489-05	Tic
\.


--
-- TOC entry 4925 (class 0 OID 16402)
-- Dependencies: 227
-- Data for Name: pga_jobclass; Type: TABLE DATA; Schema: pgagent; Owner: postgres
--

COPY pgagent.pga_jobclass (jclid, jclname) FROM stdin;
\.


--
-- TOC entry 4926 (class 0 OID 16414)
-- Dependencies: 229
-- Data for Name: pga_job; Type: TABLE DATA; Schema: pgagent; Owner: postgres
--

COPY pgagent.pga_job (jobid, jobjclid, jobname, jobdesc, jobhostagent, jobenabled, jobcreated, jobchanged, jobagentid, jobnextrun, joblastrun) FROM stdin;
\.


--
-- TOC entry 4928 (class 0 OID 16480)
-- Dependencies: 233
-- Data for Name: pga_schedule; Type: TABLE DATA; Schema: pgagent; Owner: postgres
--

COPY pgagent.pga_schedule (jscid, jscjobid, jscname, jscdesc, jscenabled, jscstart, jscend, jscminutes, jschours, jscweekdays, jscmonthdays, jscmonths) FROM stdin;
\.


--
-- TOC entry 4929 (class 0 OID 16519)
-- Dependencies: 235
-- Data for Name: pga_exception; Type: TABLE DATA; Schema: pgagent; Owner: postgres
--

COPY pgagent.pga_exception (jexid, jexscid, jexdate, jextime) FROM stdin;
\.


--
-- TOC entry 4930 (class 0 OID 16535)
-- Dependencies: 237
-- Data for Name: pga_joblog; Type: TABLE DATA; Schema: pgagent; Owner: postgres
--

COPY pgagent.pga_joblog (jlgid, jlgjobid, jlgstatus, jlgstart, jlgduration) FROM stdin;
\.


--
-- TOC entry 4927 (class 0 OID 16446)
-- Dependencies: 231
-- Data for Name: pga_jobstep; Type: TABLE DATA; Schema: pgagent; Owner: postgres
--

COPY pgagent.pga_jobstep (jstid, jstjobid, jstname, jstdesc, jstenabled, jstkind, jstcode, jstconnstr, jstdbname, jstonerror, jscnextrun) FROM stdin;
\.


--
-- TOC entry 4931 (class 0 OID 16555)
-- Dependencies: 239
-- Data for Name: pga_jobsteplog; Type: TABLE DATA; Schema: pgagent; Owner: postgres
--

COPY pgagent.pga_jobsteplog (jslid, jsljlgid, jsljstid, jslstatus, jslresult, jslstart, jslduration, jsloutput) FROM stdin;
\.


--
-- TOC entry 5191 (class 0 OID 16703)
-- Dependencies: 247
-- Data for Name: costos_vatio; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.costos_vatio (id, wp_minimo, costo_usd_vatio, celda_excel) FROM stdin;
1	2000	2.0000	Bases de Datos!L5:M36
2	4000	1.6000	Bases de Datos!L5:M36
3	6000	1.3000	Bases de Datos!L5:M36
4	8000	1.2500	Bases de Datos!L5:M36
5	10000	1.0800	Bases de Datos!L5:M36
6	12500	1.0800	Bases de Datos!L5:M36
7	20000	1.0500	Bases de Datos!L5:M36
8	27600	1.0000	Bases de Datos!L5:M36
9	33000	0.8500	Bases de Datos!L5:M36
10	50000	0.8500	Bases de Datos!L5:M36
11	60000	0.8500	Bases de Datos!L5:M36
12	100000	0.8500	Bases de Datos!L5:M36
13	120000	0.8500	Bases de Datos!L5:M36
14	150000	0.8500	Bases de Datos!L5:M36
15	175000	0.8500	Bases de Datos!L5:M36
16	200000	0.8500	Bases de Datos!L5:M36
17	250000	0.8500	Bases de Datos!L5:M36
18	300000	0.8500	Bases de Datos!L5:M36
19	350000	0.8500	Bases de Datos!L5:M36
20	400000	0.8500	Bases de Datos!L5:M36
21	450000	0.8500	Bases de Datos!L5:M36
22	500000	0.8500	Bases de Datos!L5:M36
23	550000	0.8000	Bases de Datos!L5:M36
24	600000	0.8000	Bases de Datos!L5:M36
25	650000	0.8000	Bases de Datos!L5:M36
26	700000	0.8000	Bases de Datos!L5:M36
27	750000	0.8000	Bases de Datos!L5:M36
28	800000	0.8000	Bases de Datos!L5:M36
29	850000	0.8000	Bases de Datos!L5:M36
30	900000	0.8000	Bases de Datos!L5:M36
31	950000	0.8000	Bases de Datos!L5:M36
32	1000000	0.8000	Bases de Datos!L5:M36
\.


--
-- TOC entry 5187 (class 0 OID 16615)
-- Dependencies: 243
-- Data for Name: cotizaciones; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cotizaciones (id, cliente, proyecto, ciudad, departamento, consumo_kwh, paneles, kwp, inversion_cop, ahorro_mensual_cop, creado_por, fecha_creacion, usuario_id, usuario_nombre, potencia_panel_w, radiacion_hsp, trm, area_requerida_m2, produccion_mensual_kwh, retorno_anios, tir_pct, ahorro_co2_ton, datos_cotizacion) FROM stdin;
1	Cliente Solar	Proyecto Solar	Medellín	Antioquia	2125.00	26	16.12	57687673.22	1911429.00	jrendonrios10@gmail.com	2026-11-12 09:13:29.267829	50	JUAN	620	4.65	3297.07	84.00	2248.74	2.00	0.5282	10.52	{"kwp": 16.12, "trm": 3297.07, "city": "Medellín", "tirPct": 0.528215591760508, "arboles": 21.0482064, "ahorroPct": 1.0582305882352943, "radiacion": 4.65, "clientName": "Cliente Solar", "consumoKwh": 2125, "department": "Antioquia", "flujoAnual": [{"anio": 0, "flujo": -57400669.87200001, "acumulado": -57400669.87200001}, {"anio": 1, "flujo": 22937147.999999996, "acumulado": -34463521.87200001}, {"anio": 2, "flujo": 42191046.7111224, "acumulado": 7727524.839122392}, {"anio": 3, "flujo": 28104856.540619038, "acumulado": 35832381.37974143}, {"anio": 4, "flujo": 29331296.280998714, "acumulado": 65163677.660740145}, {"anio": 5, "flujo": 30619058.00839737, "acumulado": 95782735.66913751}, {"anio": 6, "flujo": 31971207.82216596, "acumulado": 127753943.49130347}, {"anio": 7, "flujo": 29814903.393597376, "acumulado": 157568846.88490084}, {"anio": 8, "flujo": 31305648.56327725, "acumulado": 188874495.44817808}, {"anio": 9, "flujo": 32870930.991441112, "acumulado": 221745426.43961918}, {"anio": 10, "flujo": 34514477.54101317, "acumulado": 256259903.98063236}, {"anio": 11, "flujo": 36240201.41806383, "acumulado": 292500105.3986962}, {"anio": 12, "flujo": 38052211.48896702, "acumulado": 330552316.8876632}, {"anio": 13, "flujo": 39954822.06341537, "acumulado": 370507138.95107853}, {"anio": 14, "flujo": 41952563.166586146, "acumulado": 412459702.1176647}, {"anio": 15, "flujo": 44050191.324915454, "acumulado": 456509893.44258016}, {"anio": 16, "flujo": 46252700.89116123, "acumulado": 502762594.3337414}, {"anio": 17, "flujo": 48565335.93571928, "acumulado": 551327930.2694607}, {"anio": 18, "flujo": 50993602.732505254, "acumulado": 602321533.0019659}, {"anio": 19, "flujo": 53543282.869130515, "acumulado": 655864815.8710964}, {"anio": 20, "flujo": 56220447.012587056, "acumulado": 712085262.8836834}, {"anio": 21, "flujo": 59031469.3632164, "acumulado": 771116732.2468998}, {"anio": 22, "flujo": 61983042.83137722, "acumulado": 833099775.0782771}, {"anio": 23, "flujo": 65082194.97294609, "acumulado": 898181970.0512232}, {"anio": 24, "flujo": 68336304.7215934, "acumulado": 966518274.7728165}, {"anio": 25, "flujo": 71753119.95767306, "acumulado": 1038271394.7304896}, {"anio": 26, "flujo": 75340775.95555672, "acumulado": 1113612170.6860464}, {"anio": 27, "flujo": 79107814.75333457, "acumulado": 1192719985.439381}, {"anio": 28, "flujo": 83063205.49100131, "acumulado": 1275783190.9303823}, {"anio": 29, "flujo": 87216365.76555137, "acumulado": 1362999556.6959336}, {"anio": 30, "flujo": 91577184.05382895, "acumulado": 1454576740.7497625}], "panelCount": 26, "projectName": "Proyecto Solar", "ahorroCo2Ton": 10.5241032, "costoKwhBase": 850, "retornoAnios": 2, "retornoMeses": 20, "costoVatioCop": 3560.8356000000003, "potenciaPanel": 620, "areaRequeridaM2": 84, "valorKwhFactura": 850, "ahorro30AniosCop": 1454576740.7497625, "ahorroMensualCop": 1911428.9999999998, "costoSolucionCop": 57687673.221360005, "produccionAnualKwh": 26984.879999999997, "produccionMensualKwh": 2248.74}
2	juan perez	finca bolombolo	Perímetro Urbano Medellín	Antioquia	2200.00	22	15.84	56685654.08	1991325.60	jrendonrios10@gmail.com	2026-11-12 09:15:26.558643	50	JUAN	720	4.93	3297.07	72.00	2342.74	2.00	0.5534	10.96	{"kwp": 15.84, "trm": 3297.07, "city": "Perímetro Urbano Medellín", "tirPct": 0.5534135662365279, "arboles": 21.92800896, "ahorroPct": 1.06488, "radiacion": 4.93, "clientName": "juan perez", "consumoKwh": 2200, "department": "Antioquia", "flujoAnual": [{"anio": 0, "flujo": -56403635.90400001, "acumulado": -56403635.90400001}, {"anio": 1, "flujo": 23895907.2, "acumulado": -32507728.704000007}, {"anio": 2, "flujo": 42883229.505916804, "acumulado": 10375500.801916797}, {"anio": 3, "flujo": 29112964.10180928, "acumulado": 39488464.90372608}, {"anio": 4, "flujo": 30392914.981058788, "acumulado": 69881379.88478486}, {"anio": 5, "flujo": 31736863.40427077, "acumulado": 101618243.28905563}, {"anio": 6, "flujo": 33148009.24864335, "acumulado": 134766252.53769898}, {"anio": 7, "flujo": 31115765.868415356, "acumulado": 165882018.40611434}, {"anio": 8, "flujo": 32671554.16183613, "acumulado": 198553572.56795046}, {"anio": 9, "flujo": 34305131.869927935, "acumulado": 232858704.4378784}, {"anio": 10, "flujo": 36020388.463424325, "acumulado": 268879092.9013027}, {"anio": 11, "flujo": 37821407.88659555, "acumulado": 306700500.78789824}, {"anio": 12, "flujo": 39712478.280925326, "acumulado": 346412979.0688236}, {"anio": 13, "flujo": 41698102.1949716, "acumulado": 388111081.2637952}, {"anio": 14, "flujo": 43783007.30472018, "acumulado": 431894088.56851536}, {"anio": 15, "flujo": 45972157.66995619, "acumulado": 477866246.23847157}, {"anio": 16, "flujo": 48270765.553454004, "acumulado": 526137011.79192555}, {"anio": 17, "flujo": 50684303.8311267, "acumulado": 576821315.6230522}, {"anio": 18, "flujo": 53218519.02268304, "acumulado": 630039834.6457353}, {"anio": 19, "flujo": 55879444.97381719, "acumulado": 685919279.6195525}, {"anio": 20, "flujo": 58673417.22250806, "acumulado": 744592696.8420606}, {"anio": 21, "flujo": 61607088.08363345, "acumulado": 806199784.925694}, {"anio": 22, "flujo": 64687442.487815134, "acumulado": 870887227.4135091}, {"anio": 23, "flujo": 67921814.6122059, "acumulado": 938809042.025715}, {"anio": 24, "flujo": 71317905.3428162, "acumulado": 1010126947.3685312}, {"anio": 25, "flujo": 74883800.60995701, "acumulado": 1085010747.9784882}, {"anio": 26, "flujo": 78627990.64045486, "acumulado": 1163638738.618943}, {"anio": 27, "flujo": 82559390.1724776, "acumulado": 1246198128.7914205}, {"anio": 28, "flujo": 86687359.6811015, "acumulado": 1332885488.472522}, {"anio": 29, "flujo": 91021727.66515657, "acumulado": 1423907216.1376786}, {"anio": 30, "flujo": 95572814.04841441, "acumulado": 1519480030.186093}], "panelCount": 22, "projectName": "finca bolombolo", "ahorroCo2Ton": 10.96400448, "costoKwhBase": 850, "retornoAnios": 2, "retornoMeses": 19, "costoVatioCop": 3560.8356000000003, "potenciaPanel": 720, "areaRequeridaM2": 72, "valorKwhFactura": 850, "ahorro30AniosCop": 1519480030.186093, "ahorroMensualCop": 1991325.5999999999, "costoSolucionCop": 56685654.08352001, "produccionAnualKwh": 28112.832, "produccionMensualKwh": 2342.736}
\.


--
-- TOC entry 5189 (class 0 OID 16684)
-- Dependencies: 245
-- Data for Name: formulas_sistema; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.formulas_sistema (id, codigo, nombre, expresion_formula, valor_numerico, unidad, celda_excel, descripcion, fecha_actualizacion) FROM stdin;
1	VALOR_KWH_FACTURA	Tarifa Eléctrica Referencia	valorKwhFactura = 850	850.000000	COP/kWh	Cotizacion!C10	Tarifa eléctrica base de referencia en Colombia para cálculo de ahorro mensual	2026-11-10 07:40:01.316615
2	POTENCIA_REQUERIDA_W	Potencia Requerida por Consumo	potenciaRequeridaW = (consumoKwh * 1000) / (radiacion * DIAS_MES)	30.000000	días/mes	Bases de Datos!C23	Divide el consumo mensual en Wh entre las Horas Sol Pico (HSP) multiplicadas por 30 días	2026-11-10 07:40:01.316615
3	CANTIDAD_PANELES_CONSUMO	Número de Paneles (Redondeo Par Excel)	panelesReq = EVEN(potenciaRequeridaW / potenciaPanel)	2.000000	múltiplo par	Bases de Datos!C24	Redondea hacia arriba al siguiente número entero par de módulos fotovoltaicos	2026-11-10 07:40:01.316615
4	TAMANO_PANEL_M2	Área por Panel Solar	areaRequerida = EVEN(paneles * TAMANO_PANEL_M2)	3.200000	m²/panel	Bases de Datos!C26	Área física ocupada por cada módulo solar de 610W-720W	2026-11-10 07:40:01.316615
5	FACTOR_APROVECHAMIENTO_AREA	Potencia Instalable según Área Disponible	potenciaEnAreaKw = ((areaDisponible * 0.85) / TAMANO_PANEL_M2) * (potenciaPanel / 1000)	0.850000	fracción (85%)	Bases de Datos!C13	Factor de área útil descontando pasillos de mantenimiento y sombras (85%)	2026-11-10 07:40:01.316615
6	POTENCIA_PICO_MODULO_W	Potencia Pico Nominal Ofrecida	potenciaPicoOfrecida = panelesReq * 605	605.000000	W/panel	Bases de Datos!C25	Factor nominal para cálculo de potencia pico ofrecida en hoja de base de datos	2026-11-10 07:40:01.316615
7	PRODUCCION_MENSUAL_KWH	Generación Solar Mensual Estimada	produccionMensual = (paneles * potenciaPanel * radiacion * 30) / 1000	30.000000	días/mes	Bases de Datos!C27	Energía mensual producida en kWh/mes según radiación HSP de la ubicación	2026-11-10 07:40:01.316615
8	FACTOR_CO2_TON_ANUAL	Ahorro Anual de Emisiones CO2	ahorroCo2 = (((generacionTotal * 12) / 1000) / 1000) * 0.39	0.390000	ton CO2/MWh	Bases de Datos!C38	Factor oficial UPME de toneladas de CO2 evitadas por cada MWh generado	2026-11-10 07:40:01.316615
9	FACTOR_ARBOLES_EQUIV	Árboles Equivalentes Sembrados	arboles = ahorroCo2 * 2	2.000000	árboles/ton CO2	Bases de Datos!C39	Cantidad de árboles maduros equivalentes al CO2 evitado anualmente	2026-11-10 07:40:01.316615
10	COSTO_SOLUCION_BASE_COP	Inversión Base sin Ajuste	costoSolucion = costoVatioUsd * wpInstalados * trm	1.000000	factor	Cotizacion!F19	Multiplica el costo por vatio en USD según escala de potencia por los Wp instalados y la TRM	2026-11-10 07:40:01.316615
11	AJUSTE_INVERSION_PCT	Ajuste Comercial Llave en Mano (0.5%)	costoSolucionFinal = costoSolucion * (1 + 0.005)	0.005000	fracción (0.5%)	Cotizacion!F19	Ajuste comercial aplicado sobre la inversión base llave en mano	2026-11-10 07:40:01.316615
12	AHORRO_MENSUAL_COP	Ahorro Mensual Primer Año	ahorroMensualCop = valorKwhFactura * produccionMensual	850.000000	COP/kWh	Modelo Financiero Año!B6	Ahorro económico mensual en factura eléctrica durante el primer año	2026-11-10 07:40:01.316615
13	IVA_REFERENCIA_PCT	Proporción IVA Deducible Equipos	B3 = costoSolucion * ivaPct	0.110000	fracción (11%)	Modelo Financiero Año!C3	Porcentaje estimado de IVA sobre el total del proyecto para exclusión Ley 1715	2026-11-10 07:40:01.316615
14	MANTENIMIENTO_ANUAL_PCT	Costo Mantenimiento Anual O&M	B5 = costoSolucion * mantenimientoPct	0.012000	fracción (1.2%)	Modelo Financiero Año!C5	Porcentaje anual de operación y mantenimiento sobre la inversión inicial	2026-11-10 07:40:01.316615
15	INFLACION_ANUAL_PCT	Indexación Anual de Tarifa e Inflación	flujoAnual = B6 * 12 * (1 + inflacion)^(anio - 1)	0.050000	fracción (5%)	Modelo Financiero Año!K1	Crecimiento anual proyectado de la tarifa de energía y costos de mantenimiento	2026-11-10 07:40:01.316615
16	LEY1715_DEDUCCION_RENTA	Deducción Especial Renta Ley 1715 (Año 2)	beneficioRenta = (costoSolucion - IVA) * 0.50 * tasaImpositiva	0.500000	fracción (50%)	Modelo Financiero Año!K2	Deducción del 50% de la inversión sobre la renta líquida (Ley 1715 de 2014)	2026-11-10 07:40:01.316615
17	LEY1715_DEPRECIACION_ANUAL	Depreciación Acelerada Ley 1715 (Años 2 a 6)	beneficioDepreciacion = (costoSolucion - IVA) * 0.20 * tasaImpositiva	0.200000	fracción (20%)	Modelo Financiero Año!K3	Depreciación acelerada en 5 años (20% anual) sobre la base gravable	2026-11-10 07:40:01.316615
18	TASA_IMPOSITIVA_RENTA	Tarifa Impuesto de Renta Corporativo	ahorroFiscal = baseDeduccion * tasaImpositiva	0.350000	fracción (35%)	Modelo Financiero Año!K4	Tasa impositiva de renta en Colombia para cálculo del escudo fiscal	2026-11-10 07:40:01.316615
\.


--
-- TOC entry 5193 (class 0 OID 16716)
-- Dependencies: 249
-- Data for Name: radiacion_departamentos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.radiacion_departamentos (id, departamento, hsp_promedio, hsp_minimo, hsp_maximo) FROM stdin;
1	Amazonas	3.4595	2.7600	5.1000
2	Antioquia	4.1055	3.9300	5.9000
3	Arauca	4.1565	3.4000	6.6700
4	Atlántico	4.5305	4.0700	7.0500
5	Bogotá	3.5360	3.3300	5.6000
6	Bolívar	4.7600	3.7500	7.7000
7	Boyacá	4.4200	3.7300	7.4300
8	Caldas	3.7400	3.6700	5.3000
9	Caquetá	4.1693	2.8900	5.9700
10	Casanare	4.2670	3.4000	7.0300
11	Cauca	3.7740	3.4700	5.4000
12	Cesar	4.7175	4.2300	7.5700
13	Chocó	3.1705	3.3200	4.1000
14	Córdoba	4.2755	3.9700	6.5000
15	Cundinamarca	3.4450	3.0900	5.6000
16	Guanía	3.7400	3.1600	5.5700
17	Guaviare	3.7995	3.0100	5.9300
18	Huila	3.7655	3.3100	5.8000
19	La Guajira	4.7685	4.5300	7.1300
20	Magdalena	4.5815	4.1000	6.7300
21	Meta	3.9185	3.1500	6.2700
22	Nariño	3.0515	2.8400	4.5300
23	Norte de Santander	4.2755	3.9700	6.0000
24	Putumayo	3.5615	2.8300	5.3700
25	Quindío	3.4340	3.3700	4.6700
26	Risaralda	3.2385	3.3300	4.1300
27	San Andrés y Providencia	4.5560	4.1000	6.0700
28	Santander	4.2925	3.9300	6.5000
29	Sucre	4.6410	4.1700	7.4000
30	Tolima	4.2500	3.6700	6.4300
31	Valle del Cauca	3.8590	3.4700	5.6000
32	Vaupés	3.5360	2.9100	5.2300
\.


--
-- TOC entry 5195 (class 0 OID 16735)
-- Dependencies: 251
-- Data for Name: sesiones_jwt; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sesiones_jwt (id, usuario_id, email, token_jwt, fecha_creacion, fecha_expiracion, activo) FROM stdin;
1	1	admin@ticline.co	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxIiwiZW1haWwiOiJhZG1pbkB0aWNsaW5lLmNvIiwibm9tYnJlIjoiQURNSU4gVElDTElORSIsInJvbCI6IkFkbWluaXN0cmFkb3IiLCJpYXQiOjE3OTQ0OTEwMzEsImV4cCI6MTc5NDUxOTgzMX0.ev0bgCuaT9d6u_3z0Sq_RtxZypKHqoidZk1frNt6zSc	2026-11-12 08:43:51.356156	2026-11-12 16:43:51.356156	t
2	2	ingenieria@ticline.co	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIyIiwiZW1haWwiOiJpbmdlbmllcmlhQHRpY2xpbmUuY28iLCJub21icmUiOiJJTkdFTklFUsONQSBTT0xBUiIsInJvbCI6IkluZ2VuaWVybyBkZSBQcm95ZWN0b3MiLCJpYXQiOjE3OTQ0OTEwMzEsImV4cCI6MTc5NDUxOTgzMX0.993DImvfYC_p453Bq9Zdw1eP-6poN5Kh41MMSHktW1E	2026-11-12 08:43:51.371328	2026-11-12 16:43:51.371328	t
3	21	jrendonrios130@gmail.com	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIyMSIsImVtYWlsIjoianJlbmRvbnJpb3MxMzBAZ21haWwuY29tIiwibm9tYnJlIjoiSlVBTiBNQU5VRUwiLCJyb2wiOiJJbmdlbmllcm8gZGUgUHJveWVjdG9zIiwiaWF0IjoxNzk0NDkxMDMxLCJleHAiOjE3OTQ1MTk4MzF9.LON-Rs4jDauKBtXGicdgOJiqj4Jyn9dhcOJ1PrOhUYI	2026-11-12 08:43:51.37433	2026-11-12 16:43:51.37433	t
4	26	jrendonrios120@gmail.com	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIyNiIsImVtYWlsIjoianJlbmRvbnJpb3MxMjBAZ21haWwuY29tIiwibm9tYnJlIjoiSlVBTiBQUlVFQkFTIiwicm9sIjoiSW5nZW5pZXJvIGRlIFByb3llY3RvcyIsImlhdCI6MTc5NDQ5MTAzMSwiZXhwIjoxNzk0NTE5ODMxfQ.OuhCw0gxw_0TLDoiJJyEzLXY_9K0-LiqXbVHxtuDgrM	2026-11-12 08:43:51.377893	2026-11-12 16:43:51.377893	t
5	26	jrendonrios120@gmail.com	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIyNiIsImVtYWlsIjoianJlbmRvbnJpb3MxMjBAZ21haWwuY29tIiwibm9tYnJlIjoiSlVBTiBQUlVFQkFTIiwicm9sIjoiSW5nZW5pZXJvIGRlIFByb3llY3RvcyIsImlhdCI6MTc5NDQ5MTAzMSwiZXhwIjoxNzk0NTE5ODMxfQ.OuhCw0gxw_0TLDoiJJyEzLXY_9K0-LiqXbVHxtuDgrM	2026-11-12 08:43:51.606882	2026-11-12 16:43:51.606882	t
6	26	jrendonrios120@gmail.com	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIyNiIsImVtYWlsIjoianJlbmRvbnJpb3MxMjBAZ21haWwuY29tIiwibm9tYnJlIjoiSlVBTiBQUlVFQkFTIiwicm9sIjoiSW5nZW5pZXJvIGRlIFByb3llY3RvcyIsImlhdCI6MTc5NDQ5MTAzMSwiZXhwIjoxNzk0NTE5ODMxfQ.OuhCw0gxw_0TLDoiJJyEzLXY_9K0-LiqXbVHxtuDgrM	2026-11-12 08:46:28.514225	2026-11-12 16:46:28.514225	t
7	50	jrendonrios10@gmail.com	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1MCIsImVtYWlsIjoianJlbmRvbnJpb3MxMEBnbWFpbC5jb20iLCJub21icmUiOiJKVUFOIiwicm9sIjoiSW5nZW5pZXJvIGRlIFByb3llY3RvcyIsImlhdCI6MTc5NDQ5MTg5OCwiZXhwIjoxNzk0NTIwNjk4fQ.cTXfKz0XxZPeyH4DCrDMbq8Ixl1gsjDFs1_ZhJsDN9I	2026-11-12 08:58:18.958482	2026-11-12 16:58:18.958482	t
8	50	jrendonrios10@gmail.com	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1MCIsImVtYWlsIjoianJlbmRvbnJpb3MxMEBnbWFpbC5jb20iLCJub21icmUiOiJKVUFOIiwicm9sIjoiSW5nZW5pZXJvIGRlIFByb3llY3RvcyIsImlhdCI6MTc5NDQ5MTg5OCwiZXhwIjoxNzk0NTIwNjk4fQ.cTXfKz0XxZPeyH4DCrDMbq8Ixl1gsjDFs1_ZhJsDN9I	2026-11-12 08:58:24.382988	2026-11-12 16:58:24.382988	t
9	50	jrendonrios10@gmail.com	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1MCIsImVtYWlsIjoianJlbmRvbnJpb3MxMEBnbWFpbC5jb20iLCJub21icmUiOiJKVUFOIiwicm9sIjoiSW5nZW5pZXJvIGRlIFByb3llY3RvcyIsImlhdCI6MTc5NDQ5MTg5OCwiZXhwIjoxNzk0NTIwNjk4fQ.cTXfKz0XxZPeyH4DCrDMbq8Ixl1gsjDFs1_ZhJsDN9I	2026-11-12 08:58:37.8891	2026-11-12 16:58:37.8891	t
10	50	jrendonrios10@gmail.com	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1MCIsImVtYWlsIjoianJlbmRvbnJpb3MxMEBnbWFpbC5jb20iLCJub21icmUiOiJKVUFOIiwicm9sIjoiSW5nZW5pZXJvIGRlIFByb3llY3RvcyIsImlhdCI6MTc5NDQ5MTg5OCwiZXhwIjoxNzk0NTIwNjk4fQ.cTXfKz0XxZPeyH4DCrDMbq8Ixl1gsjDFs1_ZhJsDN9I	2026-11-12 09:13:08.566794	2026-11-12 17:13:08.566794	t
11	50	jrendonrios10@gmail.com	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1MCIsImVtYWlsIjoianJlbmRvbnJpb3MxMEBnbWFpbC5jb20iLCJub21icmUiOiJKVUFOIiwicm9sIjoiSW5nZW5pZXJvIGRlIFByb3llY3RvcyIsImlhdCI6MTc5NDQ5MTg5OCwiZXhwIjoxNzk0NTIwNjk4fQ.cTXfKz0XxZPeyH4DCrDMbq8Ixl1gsjDFs1_ZhJsDN9I	2026-11-12 09:14:50.721866	2026-11-12 17:14:50.721866	t
12	50	jrendonrios10@gmail.com	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1MCIsImVtYWlsIjoianJlbmRvbnJpb3MxMEBnbWFpbC5jb20iLCJub21icmUiOiJKVUFOIiwicm9sIjoiSW5nZW5pZXJvIGRlIFByb3llY3RvcyIsImlhdCI6MTc5NDQ5MTg5OCwiZXhwIjoxNzk0NTIwNjk4fQ.cTXfKz0XxZPeyH4DCrDMbq8Ixl1gsjDFs1_ZhJsDN9I	2026-11-12 09:23:57.368496	2026-11-12 17:23:57.368496	t
13	21	jrendonrios130@gmail.com	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIyMSIsImVtYWlsIjoianJlbmRvbnJpb3MxMzBAZ21haWwuY29tIiwibm9tYnJlIjoiSlVBTiBNQU5VRUwiLCJyb2wiOiJJbmdlbmllcm8gZGUgUHJveWVjdG9zIiwiaWF0IjoxNzk0NDkxMDMxLCJleHAiOjE3OTQ1MTk4MzF9.LON-Rs4jDauKBtXGicdgOJiqj4Jyn9dhcOJ1PrOhUYI	2026-11-12 10:54:34.126467	2026-11-12 18:54:34.126467	t
14	50	jrendonrios10@gmail.com	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1MCIsImVtYWlsIjoianJlbmRvbnJpb3MxMEBnbWFpbC5jb20iLCJub21icmUiOiJKVUFOIiwicm9sIjoiSW5nZW5pZXJvIGRlIFByb3llY3RvcyIsImlhdCI6MTc5NDQ5MTg5OCwiZXhwIjoxNzk0NTIwNjk4fQ.cTXfKz0XxZPeyH4DCrDMbq8Ixl1gsjDFs1_ZhJsDN9I	2026-11-12 10:54:46.174785	2026-11-12 18:54:46.174785	t
\.


--
-- TOC entry 5185 (class 0 OID 16598)
-- Dependencies: 241
-- Data for Name: usuarios; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.usuarios (id, email, password_hash, nombre, rol, fecha_creacion, token_jwt, ultimo_login) FROM stdin;
21	jrendonrios130@gmail.com	scrypt$ebc030ee42126bb6b695c9f780ae88fd$ceda158e4331d85ab1a98cf3a43ff3db923de30bd792aa5ce531afbc65fa91eeecd0256edc92150829f327d668f3b299e212a2b5f050f8b8a3c2b79bf7765cab	JUAN MANUEL	Ingeniero de Proyectos	2026-11-11 09:05:08.578083	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIyMSIsImVtYWlsIjoianJlbmRvbnJpb3MxMzBAZ21haWwuY29tIiwibm9tYnJlIjoiSlVBTiBNQU5VRUwiLCJyb2wiOiJJbmdlbmllcm8gZGUgUHJveWVjdG9zIiwiaWF0IjoxNzk0NDkxMDMxLCJleHAiOjE3OTQ1MTk4MzF9.LON-Rs4jDauKBtXGicdgOJiqj4Jyn9dhcOJ1PrOhUYI	2026-11-12 10:54:34.120758
1	admin@ticline.co	scrypt$0e58895236a27b868142ed699adae499$348e353a059e94d43f935db3fd2271be4f6f2dc1307f09c853ea686f70197a0f0745da0e0ef51f2fa6f0fc17237edebade41b9c07a51dfca6868dfe09a5ad91b	ADMIN TICLINE	Administrador	2026-11-09 15:53:38.288384	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxIiwiZW1haWwiOiJhZG1pbkB0aWNsaW5lLmNvIiwibm9tYnJlIjoiQURNSU4gVElDTElORSIsInJvbCI6IkFkbWluaXN0cmFkb3IiLCJpYXQiOjE3OTQ0OTEwMzEsImV4cCI6MTc5NDUxOTgzMX0.ev0bgCuaT9d6u_3z0Sq_RtxZypKHqoidZk1frNt6zSc	2026-11-11 11:35:05.616489
2	ingenieria@ticline.co	scrypt$e14de2e9564cee129469a626f9b61d61$ea8604748b0f6fd8f23c9c377628e0953b4237e794e6947d54a66eb720b2ba31cd846e95d22c4af9c94d2c21f7dbc639f984d30a3882e27ca5182e14cf00ec73	INGENIERÍA SOLAR	Ingeniero de Proyectos	2026-11-09 15:53:38.288384	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIyIiwiZW1haWwiOiJpbmdlbmllcmlhQHRpY2xpbmUuY28iLCJub21icmUiOiJJTkdFTklFUsONQSBTT0xBUiIsInJvbCI6IkluZ2VuaWVybyBkZSBQcm95ZWN0b3MiLCJpYXQiOjE3OTQ0OTEwMzEsImV4cCI6MTc5NDUxOTgzMX0.993DImvfYC_p453Bq9Zdw1eP-6poN5Kh41MMSHktW1E	2026-11-11 11:35:05.619615
50	jrendonrios10@gmail.com	scrypt$30abde268475b54e98d98d323c0a24f8$901121ad76d4ac842b5705be2b3122b34ba6b019a3c717f3b3e04f1e5108d6ce4d06941ef30718b0e28600ff842b95e9ae0dfd2bdf7a53c52a865918cc85a54f	JUAN	Ingeniero de Proyectos	2026-11-12 08:58:18.909155	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1MCIsImVtYWlsIjoianJlbmRvbnJpb3MxMEBnbWFpbC5jb20iLCJub21icmUiOiJKVUFOIiwicm9sIjoiSW5nZW5pZXJvIGRlIFByb3llY3RvcyIsImlhdCI6MTc5NDQ5MTg5OCwiZXhwIjoxNzk0NTIwNjk4fQ.cTXfKz0XxZPeyH4DCrDMbq8Ixl1gsjDFs1_ZhJsDN9I	2026-11-12 10:54:46.130788
26	jrendonrios120@gmail.com	scrypt$d00c25ad1f3ff827cdb5127f1b19452d$c6f5a903c116adaad62dca810fdf46851524dd3402e7674ecd61335e1e911a40c9e73273cd97f7a80c79ba5a1a1fd4ab23ee6773bb2bd4d1fe8d5166057d020c	JUAN PRUEBAS	Ingeniero de Proyectos	2026-11-11 15:36:47.495527	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIyNiIsImVtYWlsIjoianJlbmRvbnJpb3MxMjBAZ21haWwuY29tIiwibm9tYnJlIjoiSlVBTiBQUlVFQkFTIiwicm9sIjoiSW5nZW5pZXJvIGRlIFByb3llY3RvcyIsImlhdCI6MTc5NDQ5MTAzMSwiZXhwIjoxNzk0NTE5ODMxfQ.OuhCw0gxw_0TLDoiJJyEzLXY_9K0-LiqXbVHxtuDgrM	2026-11-12 08:46:28.505748
\.


--
-- TOC entry 5209 (class 0 OID 0)
-- Dependencies: 246
-- Name: costos_vatio_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.costos_vatio_id_seq', 32, true);


--
-- TOC entry 5210 (class 0 OID 0)
-- Dependencies: 242
-- Name: cotizaciones_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.cotizaciones_id_seq', 2, true);


--
-- TOC entry 5211 (class 0 OID 0)
-- Dependencies: 244
-- Name: formulas_sistema_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.formulas_sistema_id_seq', 18, true);


--
-- TOC entry 5212 (class 0 OID 0)
-- Dependencies: 248
-- Name: radiacion_departamentos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.radiacion_departamentos_id_seq', 32, true);


--
-- TOC entry 5213 (class 0 OID 0)
-- Dependencies: 250
-- Name: sesiones_jwt_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.sesiones_jwt_id_seq', 14, true);


--
-- TOC entry 5214 (class 0 OID 0)
-- Dependencies: 240
-- Name: usuarios_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.usuarios_id_seq', 56, true);


--
-- TOC entry 5026 (class 2606 OID 16712)
-- Name: costos_vatio costos_vatio_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.costos_vatio
    ADD CONSTRAINT costos_vatio_pkey PRIMARY KEY (id);


--
-- TOC entry 5028 (class 2606 OID 16714)
-- Name: costos_vatio costos_vatio_wp_minimo_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.costos_vatio
    ADD CONSTRAINT costos_vatio_wp_minimo_key UNIQUE (wp_minimo);


--
-- TOC entry 5020 (class 2606 OID 16638)
-- Name: cotizaciones cotizaciones_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cotizaciones
    ADD CONSTRAINT cotizaciones_pkey PRIMARY KEY (id);


--
-- TOC entry 5022 (class 2606 OID 16701)
-- Name: formulas_sistema formulas_sistema_codigo_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.formulas_sistema
    ADD CONSTRAINT formulas_sistema_codigo_key UNIQUE (codigo);


--
-- TOC entry 5024 (class 2606 OID 16699)
-- Name: formulas_sistema formulas_sistema_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.formulas_sistema
    ADD CONSTRAINT formulas_sistema_pkey PRIMARY KEY (id);


--
-- TOC entry 5030 (class 2606 OID 16728)
-- Name: radiacion_departamentos radiacion_departamentos_departamento_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.radiacion_departamentos
    ADD CONSTRAINT radiacion_departamentos_departamento_key UNIQUE (departamento);


--
-- TOC entry 5032 (class 2606 OID 16726)
-- Name: radiacion_departamentos radiacion_departamentos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.radiacion_departamentos
    ADD CONSTRAINT radiacion_departamentos_pkey PRIMARY KEY (id);


--
-- TOC entry 5034 (class 2606 OID 16748)
-- Name: sesiones_jwt sesiones_jwt_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sesiones_jwt
    ADD CONSTRAINT sesiones_jwt_pkey PRIMARY KEY (id);


--
-- TOC entry 5016 (class 2606 OID 16613)
-- Name: usuarios usuarios_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_email_key UNIQUE (email);


--
-- TOC entry 5018 (class 2606 OID 16611)
-- Name: usuarios usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_pkey PRIMARY KEY (id);


--
-- TOC entry 5035 (class 2606 OID 16754)
-- Name: cotizaciones cotizaciones_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cotizaciones
    ADD CONSTRAINT cotizaciones_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE SET NULL;


--
-- TOC entry 5036 (class 2606 OID 16749)
-- Name: sesiones_jwt sesiones_jwt_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sesiones_jwt
    ADD CONSTRAINT sesiones_jwt_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


-- Completed on 2026-11-12 11:17:37

--
-- PostgreSQL database dump complete
--

\unrestrict Y5oRFwDmdIoiX2cFfFkdUoFkKIVFRWtHBWg0LrteZL3IJhS3zrn4QzmTFJIaaSP


"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcrypt"));
require("dotenv/config");
const pg_1 = require("pg");
const adapter_pg_1 = require("@prisma/adapter-pg");
const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
    throw new Error('DATABASE_URL is not defined in environment variables');
}
const pool = new pg_1.Pool({ connectionString: dbUrl });
const adapter = new adapter_pg_1.PrismaPg(pool);
const prisma = new client_1.PrismaClient({ adapter });
async function main() {
    console.log('--- Iniciando Limpieza de Base de Datos ---');
    await prisma.comment.deleteMany({});
    await prisma.document.deleteMany({});
    await prisma.ticketHistory.deleteMany({});
    await prisma.auditLog.deleteMany({});
    await prisma.ticket.deleteMany({});
    await prisma.workGroupTopic.deleteMany({});
    await prisma.workGroupMember.deleteMany({});
    await prisma.workGroup.deleteMany({});
    try {
        await prisma.tramiteHistory?.deleteMany({});
        await prisma.tramite?.deleteMany({});
    }
    catch (e) {
        console.log('Tablas de trámites no encontradas o ya eliminadas.');
    }
    await prisma.workflowState.deleteMany({});
    await prisma.category.deleteMany({});
    await prisma.subcategory.deleteMany({});
    await prisma.teamSettings.deleteMany({});
    await prisma.user.deleteMany({});
    console.log('--- Base de Datos Limpia ---');
    const password = await bcrypt.hash('1234', 10);
    const adminUser = await prisma.user.create({
        data: {
            email: 'admin@test.com',
            password,
            name: 'Administrador Sistema',
            role: 'ADMIN',
        },
    });
    const supervisorUser = await prisma.user.create({
        data: {
            email: 'supervisor@test.com',
            password,
            name: 'Supervisor de Área',
            role: 'SUPERVISOR',
        },
    });
    const operatorUser = await prisma.user.create({
        data: {
            email: 'operador@test.com',
            password,
            name: 'Operador de Campo',
            role: 'OPERARIO',
        },
    });
    console.log('Usuarios creados:', {
        admin: adminUser.email,
        supervisor: supervisorUser.email,
        operator: operatorUser.email,
    });
    const states = [
        { name: 'NUEVO', description: 'Ticket recién creado' },
        { name: 'EN_PROCESO', description: 'Ticket siendo atendido' },
        { name: 'COMPLETADO', description: 'Ticket resuelto con éxito' },
        { name: 'CANCELADO', description: 'Ticket anulado' },
        { name: 'CERRADO', description: 'Ticket finalizado y archivado' },
    ];
    const createdStates = await Promise.all(states.map(state => prisma.workflowState.create({ data: state })));
    const stateMap = createdStates.reduce((acc, s) => ({ ...acc, [s.name]: s.id }), {});
    console.log('Estados de workflow creados.');
    const categories = [
        { name: 'SOPORTE', description: 'Consultas técnicas y ayuda' },
        { name: 'OBRA', description: 'Gestión de proyectos en campo' },
        { name: 'DOCUMENTACIÓN', description: 'Trámites y archivos legales (Cartas, Oficios)' },
    ];
    const createdCategories = await Promise.all(categories.map(cat => prisma.category.create({ data: cat })));
    const categoryMap = createdCategories.reduce((acc, c) => ({ ...acc, [c.name]: c.id }), {});
    console.log('Categorías creadas.');
    const subcategories = [
        { name: 'Coordinación', description: 'Chat y seguimiento operativo', categoryName: 'SOPORTE' },
        { name: 'Documentos técnicos', description: 'Planos, informes y especificaciones', categoryName: 'OBRA' },
        { name: 'Carta', description: 'Comunicaciones formales por carta', categoryName: 'DOCUMENTACIÓN' },
        { name: 'Oficio', description: 'Oficios institucionales', categoryName: 'DOCUMENTACIÓN' },
        { name: 'Convenios', description: 'Acuerdos y convenios interinstitucionales', categoryName: 'DOCUMENTACIÓN' },
    ];
    for (const sub of subcategories) {
        await prisma.subcategory.create({
            data: {
                name: sub.name,
                description: sub.description,
                categoryId: categoryMap[sub.categoryName],
            },
        });
    }
    console.log('Subcategorías creadas.');
    await prisma.teamSettings.create({
        data: {
            displayName: 'CONECTA Operaciones',
            groupIdentifier: 'GRUPO-LIM-001',
            logoUrl: null,
            primaryColor: '#2563eb',
        },
    });
    console.log('Configuración de equipo creada.');
    const group1 = await prisma.workGroup.create({
        data: {
            name: 'Proyecto 1',
            identifier: 'PROYECTO-1',
            description: 'Grupo principal de operaciones Lima',
            primaryColor: '#2563eb',
            members: {
                create: [
                    { userId: adminUser.id, roleInGroup: 'LEAD' },
                    { userId: supervisorUser.id, roleInGroup: 'LEAD' },
                    { userId: operatorUser.id, roleInGroup: 'MEMBER' },
                ],
            },
            topics: {
                create: [
                    { categoryId: categoryMap['SOPORTE'] },
                    { categoryId: categoryMap['DOCUMENTACIÓN'] },
                ],
            },
        },
    });
    const group2 = await prisma.workGroup.create({
        data: {
            name: 'Grupo 2',
            identifier: 'GRUPO-2',
            description: 'Segundo equipo de campo',
            primaryColor: '#0f766e',
            members: {
                create: [
                    { userId: adminUser.id, roleInGroup: 'LEAD' },
                    { userId: operatorUser.id, roleInGroup: 'MEMBER' },
                ],
            },
            topics: {
                create: [{ categoryId: categoryMap['OBRA'] }],
            },
        },
    });
    await prisma.user.update({
        where: { id: adminUser.id },
        data: { activeWorkGroupId: group1.id, phone: '+51999999001' },
    });
    await prisma.user.update({
        where: { id: supervisorUser.id },
        data: { activeWorkGroupId: group1.id, phone: '+51999999002' },
    });
    await prisma.user.update({
        where: { id: operatorUser.id },
        data: { activeWorkGroupId: group1.id, phone: '+51999999003' },
    });
    console.log('Grupos de trabajo creados:', { group1: group1.identifier, group2: group2.identifier });
    const sampleTickets = [
        {
            title: 'Reparación de luminaria en Sector A',
            description: 'La luminaria principal del sector A no enciende desde ayer.',
            stateName: 'NUEVO',
            categoryName: 'SOPORTE',
            priority: 'URGENTE',
        },
        {
            title: 'Fuga de agua en sótano',
            description: 'Se detectó una pequeña filtración en la tubería de desagüe.',
            stateName: 'EN_PROCESO',
            categoryName: 'OBRA',
            priority: 'MEDIA',
            latitude: -12.046374,
            longitude: -77.042793,
        },
        {
            title: 'Oficio Nro 124-2024: Solicitud de Materiales',
            description: 'Documento formal para la adquisición de cemento y agregados.',
            stateName: 'NUEVO',
            categoryName: 'DOCUMENTACIÓN',
            priority: 'MEDIA',
        },
        {
            title: 'Carta de Aceptación de Obra',
            description: 'Confirmación de recepción de los trabajos realizados en el Sector B.',
            stateName: 'COMPLETADO',
            categoryName: 'DOCUMENTACIÓN',
            priority: 'BAJA',
        },
        {
            title: 'Mantenimiento preventivo de ascensor',
            description: 'Revisión mensual programada para el ascensor 2.',
            stateName: 'NUEVO',
            categoryName: 'SOPORTE',
            priority: 'MEDIA',
        },
    ];
    for (const t of sampleTickets) {
        const ticket = await prisma.ticket.create({
            data: {
                title: t.title,
                description: t.description,
                workflowStateId: stateMap[t.stateName],
                categoryId: categoryMap[t.categoryName],
                userId: operatorUser.id,
                priority: t.priority,
                latitude: t.latitude,
                longitude: t.longitude,
                workGroupId: group1.id,
            },
        });
        await prisma.comment.create({
            data: {
                content: `Ticket creado automáticamente por el sistema para la categoría ${t.categoryName}.`,
                userId: adminUser.id,
                ticketId: ticket.id,
            },
        });
        console.log(`Ticket creado: ${ticket.title} (ID: ${ticket.id})`);
    }
    console.log('--- Seed completado con éxito ---');
}
main()
    .catch((e) => {
    console.error('Error durante el seed:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map
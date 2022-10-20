import { Application, Router, Request, Response} from "express";
import HttpStatusCodes from 'http-status-codes';
import DatabaseConnection from "../database/DatabaseConnetion";
import Lugares from "../models/entities/Lugar";
import Reservacion from "../models/entities/Reservacion";

interface registrarReservacion {
    nombreCompleto: string; 
    correo:string;
    telefono: string;
    evento:string;
    numPersonas: number;
    fechaEvento: Date;
    horaEvento: string;
    lugarId: number;
    mensaje: string;
}

export default class ReservacionController{

    private router: Router;

    private constructor(app: Application)
    {
        this.router = Router();
        this.initializeRouter();
        app.use('/reservacion', this.router);
    }

    protected initializeRouter(): void
    {

        this.router.post('/', this.nuevaReservacion);
        this.router.post('/:id', this.confirmarReservacion);
    }
    //Complete
    public async confirmarReservacion(req: Request, res: Response): Promise<void>
    {
        try
        {
            const repository = await DatabaseConnection.getRepository(Reservacion);
            const reservacion: Reservacion[] = await repository.findBy({ codigoEstado: true });

            res.status(200).json(reservacion);
        }
        catch(e)
        {
            console.error(e);
            res.status(500).end();
        }
    }
    //Complete
    public async nuevaReservacion(req: Request, res: Response): Promise<void>
    {
        try
        {
            const{nombreCompleto, correo, telefono, evento, numPersonas, fechaEvento, horaEvento, lugarId, mensaje} = <registrarReservacion> req.body;

            if(!nombreCompleto || !correo || !telefono || !evento || !numPersonas 
                || !fechaEvento || !horaEvento || !lugarId ||!mensaje)
            {
                res.status(400).end();
                return;
            }

            const repository = await DatabaseConnection.getRepository(Reservacion);
            const repositoryLugar = await DatabaseConnection.getRepository(Lugares);

            const lugar = await Lugares.consultaLugarId(lugarId);

            const reservacion = new Reservacion();
            reservacion.nombreCompleto = nombreCompleto;
            reservacion.correo = correo;
            reservacion.telefono = telefono;
            reservacion.evento = evento;
            reservacion.numPersonas = numPersonas;
            reservacion.fechaEvento = fechaEvento;
            reservacion.horaEvento = horaEvento;
            reservacion.lugar = lugar;
            reservacion.mensaje = mensaje;
            reservacion.codigoEstado = true;
            
            await repository.save(reservacion);
            res.status(200).end();
        }
        catch(e)
        {
            console.log(e);
            res.status(500).json(e);
        }
    }

    public static mount (app: Application): ReservacionController
    {
        return new ReservacionController(app);
    }
}


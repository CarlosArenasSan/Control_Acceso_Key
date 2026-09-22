import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { Administrador } from '../entities/administrador.entity';
import { Empleado } from '../entities/empleado.entity';
interface LoginDto {
    username: string;
    password: string;
}
export declare class AuthService {
    private readonly administradorRepository;
    private readonly empleadoRepository;
    private readonly jwtService;
    constructor(administradorRepository: Repository<Administrador>, empleadoRepository: Repository<Empleado>, jwtService: JwtService);
    login(data: LoginDto): Promise<{
        token: string;
        user: {
            id: number;
            username: string;
            role: "admin";
            fullName: string;
        };
    } | {
        token: string;
        user: {
            id: number;
            username: string;
            role: "empleado";
            fullName: string;
        };
    }>;
    private loginAdmin;
    private loginEmpleado;
}
export {};

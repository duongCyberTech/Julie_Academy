import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserDto } from './dto/user.dto';
const bcrypt = require('bcrypt')
require('dotenv').config()

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async createUser(data: UserDto) {
    console.log(data)
    const hashPassword = await bcrypt.hash(data.password, 12)
    console.log(hashPassword)
    return this.prisma.user.create({
      data: {
        username: data.username,
        fname: data.fname,
        mname: data.mname,
        lname: data.lname,
        email: data.email,
        password: hashPassword,
        role: data.role,
        status: data.status,
        avata_url: data.avata_url || "",
        description: data.description || "",
        DoB: data.DoB,
        phone_number: data.phone_number
      },
    });    
  }

  findAll() {
    return this.prisma.user.findMany();
  }

  findByEmail(email: string){
    return this.prisma.user.findUnique({
      where: {
        email: email,
      }
    })
  }
}

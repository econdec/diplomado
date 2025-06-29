import { User } from '../models/user.js';
import { Task } from '../models/task.js';
import logger from '../logs/logger.js';
import { Status } from '../constants/index.js';
import { encriptar } from '../common/bcrypt.js';
import { Op } from 'sequelize';
/*function getUsers(req, res){
    res.json({
        message: 'Welcome to the Users API dede el controller',
    });
}*/

async function getUsers(req, res, next) {
    try {
        const users = await User.findAll({
            attributes: ['id','username','password','status'],
            order: [['id','DESC']],
            where: {
                status: Status.ACTIVE,
            },
        });
        res.json(users);
    } catch (error) {
        //logger.error(error.message);
        //res.status(500).json({ message: error.message });
        next(error);
    }
}

async function createUser(req, res, next) {
    const { username, password} = req.body;
    try {
        // encryptar
        const user = await User.create({
            username,
            password
        })
        res.json(user)
    } catch (error) {
        //logger.error(error.message);
        //res.status(500).json({ message: error.message });
        next(error);
    }

}
async function getUser(req, res, next) {
    const { id } = req.params;
    try {
        const user = await User.findOne({
            attributes: ['username','password', 'status'],
            where: {
                id
            },
        });
        if(!user) res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (error) {
        next(error);
    }
}

async function updateUser(req, res, next) {
    const { id } = req.params;
    const { username, password } = req.body;
    try {
        if(!username && !password) {
            return res
            .status(400)
            .json({ message: 'Username and password are required' });
        }
        const passwordEncriptado = await encriptar(password);
        const user = await User.update({
            username,
            password: passwordEncriptado,
        }, {
            where: { 
                id, 
            },
        });
        
        res.json(user);
    } catch (error) {
        next(error);
    }
}
async function deleteUser(req, res, next) {
    const { id } = req.params;
    try {
        const user = await User.destroy({
            where: { 
                id, 
            },
        });
        res.status(204).json({ message: 'User deleted' });
    } catch (error) {
        next(error);
    }
}
async function activateInactivate(req,res,next) {
    const { id } = req.params;
    const { status } = req.body;
    try {  
        if (!status) res.status(400).json({ message: 'Status is required' });
        const user = await User.findByPk(id);
        
        if (!user) res.status(404).json({ message: 'User not found' });
        
        if(user.status === status) {
            res.status(409).json({ message: 'Same status' });
        }
        
        user.status = status;
        await user.save();
        res.json(user);
    }   catch (error) {
        next(error);
    }
}

async function getTasks(req, res, next) {
    const { id } = req.params;
    try {
        const user = await User.findOne({
            attributes: ['username'],
            include:[
                {
                    model: Task,
                    attributes: ['name', 'done'],
                    where: {
                        done: false
                    },
                }
            ],
            where: {
                id,
            },
        })
        res.json(user);        
    } catch (error) {
        next(error);
    }
}

async function getUserPagination(req, res, next) {
    const { page, limit, search, orderBy, orderDir } = req.body;
    const pageNum = parseInt(page) || 1;    
    const limitNum = [5, 10, 15, 20].includes(parseInt(limit)) ? limit : 10;
    const searchText = search || '';
    const orderByText = ['id','username', 'status'].includes(orderBy) ? orderBy : 'id';
    const orderDirText = orderDir.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';            
    const offset = (pageNum - 1) * limitNum;
    let where = { username: { [Op.iLike]: '%'+searchText+'%' } };    
    try {
        
        const totalUsers = await User.count({
            where
        });
        if(totalUsers === 0) {
            where = {};            
        }        
        const { count:total, rows:data } = await User.findAndCountAll({
                attributes: ['id', 'username', 'status'],
                order: [[orderByText, orderDirText]],            
                limit: limitNum,
                offset,
                where
        });        
        //res.json('page:_'+pageNum+' limit:_'+limitNum+' search:_'+searchText+' orderBy:_'+orderByText+' orderDir:_'+orderDirText);
        const pages= Math.ceil(total / limit);
        res.json({            
            total,
            page,
            pages,
            data            
        })
    } catch (error) {
        next(error);
    }
}

export default {
    getUsers,
    createUser,
    getUser,
    updateUser,
    deleteUser,
    activateInactivate,
    getTasks,
    getUserPagination
};

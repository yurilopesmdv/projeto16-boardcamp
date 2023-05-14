import  {db}  from "../database/database.connection.js"
import dayjs from 'dayjs'

export async function getAllRentals(req, res) {
    
    try {
        const rentals = await db.query(`
        SELECT 
                rentals.*,
                customers.id AS "customer.id",
                customers.name AS "customerName",
                games.id AS "gameId",
                games.name AS "gameName"
                FROM customers
            JOIN rentals ON customers.id = rentals."customerId"
            JOIN games ON games.id = rentals."gameId"
        `)
        const treatedRentals = rentals?.rows.map((rental) => {
            const {id, customerId, gameId, rentDate, daysRented, returnDate, originalPrice, delayFee, gameName, customerName } = rental
            return {
                id, customerId, gameId, rentDate: dayjs(rentDate).format('YYYY-MM-DD'),
                daysRented, returnDate: returnDate ? dayjs(returnDate).format('YYYY-MM-DD') : null,
                originalPrice, delayFee,
                customer: {id: customerId, name: customerName},
                game: {id: gameId, name: gameName}
            }
            })
        res.send(treatedRentals)
    } catch(err) {
        res.status(500).send(err.message)
    }
}

export async function postRental(req, res) {
    const {customerId, gameId, daysRented} = req.body
    try {
        //Existence validate
        const costumerExists = await db.query(`SELECT * FROM customers WHERE id=$1`, [customerId])
        const gameExists = await db.query(`SELECT * FROM games WHERE id=$1`, [gameId])
        if(!costumerExists.rowCount || !gameExists.rowCount ) return res.sendStatus(400)
        //Quantity validate
        
        const rentals = await db.query(`SELECT * FROM rentals WHERE "gameId"=$1 AND "returnDate" is NULL`, [gameId])
        const stockTotal = gameExists.rows[0].stockTotal
        if(rentals.rowCount - stockTotal < 1) return res.sendStatus(400)
        
        
        const pricePerDay = gameExists.rows[0].pricePerDay
        const {rentDate, returnDate, originalPrice, delayFee} = {
            rentDate: dayjs().format("YYYY-MM-DD"),
            returnDate: null,
            originalPrice: daysRented * pricePerDay,
            delayFee: null
        }
        
        const rent = await db.query(`
        INSERT INTO rentals
        ("customerId", "gameId", "rentDate", "daysRented", "returnDate", "originalPrice", "delayFee")
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, 
        [customerId, gameId, rentDate, daysRented, returnDate, originalPrice, delayFee])
        res.sendStatus(201)
    } catch(err) {
        res.status(500).send(err.message)
    }
}

export async function endRental(req, res) {
    try {

    } catch(err) {
        res.status(500).send(err.message)
    }
}

export async function deleteRental(req, res) {
    try {

    } catch(err) {
        res.status(500).send(err.message)
    }
}
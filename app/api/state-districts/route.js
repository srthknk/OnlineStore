import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/state-districts - Get all states or filter by state to get districts
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url)
        const state = searchParams.get('state')

        if (state) {
            // Return districts for a specific state
            const districts = await prisma.stateDistrict.findMany({
                where: { state },
                select: { district: true },
                distinct: ['district'],
                orderBy: { district: 'asc' }
            })
            return NextResponse.json({
                state,
                districts: districts.map(d => d.district)
            })
        } else {
            // Return all unique states
            const states = await prisma.stateDistrict.findMany({
                select: { state: true },
                distinct: ['state'],
                orderBy: { state: 'asc' }
            })
            return NextResponse.json({
                states: states.map(s => s.state)
            })
        }
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: error.message }, { status: 400 })
    }
}

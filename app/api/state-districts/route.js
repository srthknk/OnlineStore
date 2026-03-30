import stateDistrictData from '@/data/indiaStateDistricts.json';

/**
 * GET /api/state-districts
 * Get all Indian states or districts for a specific state
 * 
 * Query Parameters:
 * - state (optional): State name to get districts for
 * 
 * Response Examples:
 * GET /api/state-districts
 * { success: true, states: ['Andhra Pradesh', 'Arunachal Pradesh', ...], total: 28 }
 * 
 * GET /api/state-districts?state=Maharashtra
 * { success: true, state: 'Maharashtra', districts: ['Ahmednagar', 'Akola', ...] }
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const stateParam = searchParams.get('state');

    // If state parameter is provided, return districts for that state
    if (stateParam) {
      const stateData = stateDistrictData.states.find(
        (s) => s.state.toLowerCase() === stateParam.toLowerCase()
      );

      if (!stateData) {
        return Response.json(
          {
            success: false,
            message: 'State not found',
            state: stateParam,
            districts: [],
          },
          { status: 404 }
        );
      }

      return Response.json({
        success: true,
        state: stateData.state,
        districts: stateData.districts || [],
        total: stateData.districts?.length || 0,
      });
    }

    // Otherwise, return all states
    const states = stateDistrictData.states.map((s) => s.state);

    return Response.json({
      success: true,
      states,
      total: states.length,
    });
  } catch (error) {
    console.error('Error fetching state/districts:', error);
    return Response.json(
      {
        success: false,
        message: 'Failed to fetch state/districts data',
        error: error.message,
      },
      { status: 500 }
    );
  }
}

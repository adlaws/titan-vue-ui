const DEG2RAD = Math.PI / 180.0;
const _360DEG = (Math.PI * 2.0);
const _90DEG = _360DEG / 4.0;

export default class SVGUtils
{
    /**
     * Provides the SVG polygon points for a regular polygon.
     *
     * Example use:
     *
     *     // create a triangle with radius 20 at (100,100) rotated at 45 degrees
     *     const points = describeRegularPolygon(100, 100, 20, 3, 45);
     *     const svgPolygon = '<polygon points="${points}"/>';
     *
     * @param {number} cx the center X position of the polygon
     * @param {number} cy the center Y position of the polygon
     * @param {number} radius the radius of the polygon
     * @param {number} sideCount the number of sides for the polygon (must be at least 3)
     * @param {number} angle the angle, in degrees, to rotate the polygon (defaults to 0)
     * @returns {string} the points of the polygon, suitable for use as a <polygon> element's
     *          `points` attribute value
     */
    static describeRegularPolygon(cx, cy, radius, sideCount, angle=0)
    {
        radius = radius < 0 ? 0 : radius;
        sideCount = sideCount < 3 ? 3 : sideCount;
        const step = 360.0 / sideCount;
        const points = [];
        for(let idx=0;idx<sideCount;idx++)
        {
            const xy = SVGUtils._circleXY(angle + (step * idx), radius);
            points.push({
                x: xy.x + cx,
                y: xy.y + cy
            });
        }
        const result = points.map((xy) => `${xy.x},${xy.y}`).join(' ');
        return result;
    }

    /**
     * Provides the SVG path description points for an arc, wedge or subsection of a wedge
     *
     * Example use:
     *
     *     // create an arc with radius 20 from 30 degrees to 60 degrees centered at (100,100)
     *     const arc = describeSvgArc(100, 100, 0, 20, 30, 60);
     *     const svgArc = '<path d="${arc}"/>';
     *     // create a wedge with radius 20 from 30 degrees to 60 degrees centered at (100,100)
     *     const wedge = describeSvgArc(100, 100, 0, 20, 30, 60, true);
     *     const svgWedge = '<path d="${wedge}"/>';
     *     // create wedge segment with inner radius 20, outer radius 40 from 30 degrees to 60
     *     // degrees centered at (100,100)
     *     const wedgeSegment = describeSvgArc(100, 100, 20, 40, 30, 60, true);
     *     const svgWedgeSegment = '<path d="${wedgeSegment}"/>';
     *
     * @param {number} cx the center X position of the arc
     * @param {number} cy the center Y position of the arc
     * @param {number} radiusInner the inner radius of the arc
     * @param {number} radiusOuter the inner radius of the arc
     * @param {number} startAngle the start angle of the arc
     * @param {number} endAngle the end angle of the arc
     * @param {number} wedge only relevant if radiusInner is 0 - create a wedge from the center,
     *                 instead of just an arc at the outer radius (defaults to false)
     * @returns {string} the arc/wedge description, suitable for use as a <path> element's
     *          `d` attribute value
     */
    static describeSvgArc(cx, cy, radiusInner, radiusOuter, startAngle, endAngle, wedge=false)
    {
        if(radiusInner > radiusOuter)
        {
            const temp = radiusInner;
            radiusInner = radiusOuter;
            radiusOuter = temp;
        }

        // determines whether the arc needs to travel from start to end angles
        // in a clockwise or anti-clockwise direction
        const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

        let arc = '';
        if(radiusInner === 0)
        {
            // inner radius is 0, so it's either just the arc, or a "pie wedge"
            const start = SVGUtils._polarToCartesian(cx, cy, radiusOuter, endAngle);
            const end = SVGUtils._polarToCartesian(cx, cy, radiusOuter, startAngle);
            arc += `M ${start.x} ${start.y} A ${radiusOuter} ${radiusOuter} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
            if(wedge)
            {
                // create extra line for the "pie wedge"
                arc += ` L ${cx} ${cy} ${start.x} ${start.y}`;
            }
        }
        else
        {
            // start with the outer arc
            const startOuter = SVGUtils._polarToCartesian(cx, cy, radiusOuter, endAngle);
            const endOuter = SVGUtils._polarToCartesian(cx, cy, radiusOuter, startAngle);
            // outer arc
            arc += `M ${startOuter.x} ${startOuter.y}`; // move to start
            arc += ` A ${radiusOuter} ${radiusOuter} 0 ${largeArcFlag} 0 ${endOuter.x} ${endOuter.y}`; // draw arc
            if( radiusInner !== radiusOuter )
            {
                // inner radius differs from the outer radius, so it's a wedge segment
                const startInner = SVGUtils._polarToCartesian(cx, cy, radiusInner, startAngle);
                const endInner = SVGUtils._polarToCartesian(cx, cy, radiusInner, endAngle);
                // line from outer arc to inner arc
                arc += ` L ${startInner.x} ${startInner.y}`;
                // inner arc
                arc += ` A ${radiusInner} ${radiusInner} 0 ${largeArcFlag} 1 ${endInner.x} ${endInner.y}`;
                // line from inner arc to outer arc
                arc += ` L ${startOuter.x} ${startOuter.y}`;
            }
        }
        return arc;
    }

    /**
     * Utility method to calculate the (x,y) coordinates of a point on a circle for a given angle
     * form the circle's center
     *
     * @param {number} angle the angle of the point from the center
     * @param {number} radius the radius of the circle (defaults to 1, for a unit circle)
     * @returns {object} the coordinates of the point as a object of the form {x:X, y:Y}
     */
    static _circleXY(angle, radius=1)
    {
        let radians = (angle * DEG2RAD);
        radians -= _90DEG; // to make 0 degrees at 12 o'clock position instead of 3 o'clock
        return {
            x: Math.cos(radians) * radius,
            y: Math.sin(radians) * radius,
        };
    }

    /**
     * Utility method to convert polar coordinates to cartesian coordinates
     *
     * @param {number} cx the X center of the polar coordinate
     * @param {number} cy the Y center of the polar coordinate
     * @param {number} radius the radius portion of the polar coordinate
     * @param {number} angle the angular portion of the polar coordinate in degrees
     */
    static _polarToCartesian(cx, cy, radius, angle)
    {
        const xy = this._circleXY(angle, radius);
        return {
            x: cx + xy.x,
            y: cy + xy.y,
        };
    }
}

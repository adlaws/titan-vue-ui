const DEG2RAD = Math.PI / 180.0;
const _360DEG = (Math.PI * 2.0);
const _90DEG = _360DEG / 4.0;

export default class SVGUtils
{
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

    static describeSvgArc(cx, cy, radiusInner, radiusOuter, startAngle, endAngle, wedge=false)
    {
        if(radiusInner > radiusOuter)
        {
            const temp = radiusInner;
            radiusInner = radiusOuter;
            radiusOuter = temp;
        }
        const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

        if(radiusInner === 0)
        {
            const start = SVGUtils._polarToCartesian(cx, cy, radiusOuter, endAngle);
            const end = SVGUtils._polarToCartesian(cx, cy, radiusOuter, startAngle);
            let arc = `M ${start.x} ${start.y} A ${radiusOuter} ${radiusOuter} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
            if(wedge)
                arc += ` L ${cx} ${cy} ${start.x} ${start.y}`;
            return arc;
        }

        const startOuter = SVGUtils._polarToCartesian(cx, cy, radiusOuter, endAngle);
        const endOuter = SVGUtils._polarToCartesian(cx, cy, radiusOuter, startAngle);
        const startInner = SVGUtils._polarToCartesian(cx, cy, radiusInner, startAngle);
        const endInner = SVGUtils._polarToCartesian(cx, cy, radiusInner, endAngle);

        let arc = `M ${startOuter.x} ${startOuter.y}`;
        arc += ` A ${radiusOuter} ${radiusOuter} 0 ${largeArcFlag} 0 ${endOuter.x} ${endOuter.y}`;
        if( radiusInner !== radiusOuter )
        {
            arc += ` L ${startInner.x} ${startInner.y}`;
            arc += ` A ${radiusInner} ${radiusInner} 0 ${largeArcFlag} 1 ${endInner.x} ${endInner.y}`;
            arc += ` L ${startOuter.x} ${startOuter.y}`;
        }

        return arc;
    }

    static _circleXY(angle, radius=1)
    {
        let radians = (angle * DEG2RAD);
        radians -= _90DEG; // to make 0 degrees at 12 o'clock position instead of 3 o'clock
        return {
            x: Math.cos(radians) * radius,
            y: Math.sin(radians) * radius,
        };
    }

    static _polarToCartesian(centerX, centerY, radius, angleInDegrees)
    {
        const xy = this._circleXY(angleInDegrees, radius);
        return {
            x: centerX + xy.x,
            y: centerY + xy.y,
        };
    }
}
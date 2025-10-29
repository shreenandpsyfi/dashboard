import React, { useState, useMemo } from 'react';

const ParliamentChart = () => {
  // Your data - EXACT colors matching the image
  const [data, setData] = useState([
    { cluster: 'The Pragmatic Optimiser', size: 74, color: '#B85860' },
    { cluster: 'The Emotionally Engaged', size: 27, color: '#7A4458' },
    { cluster: 'The Clarity Seeking Professional', size: 33, color: '#E07856' },
    { cluster: 'The Grounded Go-Getter', size: 33, color: '#9370DB' },
    { cluster: 'The Pattern Breaker', size: 18, color: '#D4BADB' }
  ]);

  const [hoveredCluster, setHoveredCluster] = useState(null);

  const totalSeats = data.reduce((sum, d) => sum + d.size, 0);

  // Generate seats arranged LEFT TO RIGHT with proper spacing
  const seats = useMemo(() => {
    const rows = 7;
    const seatsPerRow = [12, 16, 20, 24, 28, 32, 36]; // Better spacing
    const innerRadius = 150;
    const rowSpacing = 26; // More spacing between rows
    const centerX = 400;
    const centerY = 420;
    const arcAngle = 180; // Perfect semicircle
    
    // Step 1: Generate all seat positions first
    const allPositions = [];
    for (let row = 0; row < rows; row++) {
      const radius = innerRadius + row * rowSpacing;
      const seatsInThisRow = seatsPerRow[row];
      
      for (let seat = 0; seat < seatsInThisRow; seat++) {
        const angle = 180 - (seat / (seatsInThisRow - 1)) * arcAngle;
        const radian = (angle * Math.PI) / 180;
        const x = centerX + radius * Math.cos(radian);
        const y = centerY - radius * Math.sin(radian);
        
        allPositions.push({
          x,
          y,
          angle,
          radius: 11
        });
      }
    }
    
    // Step 2: Sort all positions by angle (LEFT to RIGHT: 180° to 0°)
    allPositions.sort((a, b) => b.angle - a.angle);
    
    // Step 3: Assign clusters LEFT TO RIGHT based on their sizes
    let currentClusterIndex = 0;
    let seatsAssignedInCurrentCluster = 0;
    
    const seatsWithClusters = allPositions.map((pos, idx) => {
      // Move to next cluster if we've assigned all seats for current cluster
      while (seatsAssignedInCurrentCluster >= data[currentClusterIndex].size && currentClusterIndex < data.length - 1) {
        currentClusterIndex++;
        seatsAssignedInCurrentCluster = 0;
      }
      
      const cluster = data[currentClusterIndex];
      seatsAssignedInCurrentCluster++;
      
      return {
        ...pos,
        cluster: cluster.cluster,
        color: cluster.color,
        size: cluster.size
      };
    });
    
    return seatsWithClusters;
  }, [data, totalSeats]);

  const centerInfo = useMemo(() => {
    if (hoveredCluster) {
      const cluster = data.find(d => d.cluster === hoveredCluster);
      return { size: cluster.size, name: cluster.cluster };
    }
    return { size: totalSeats, name: '' };
  }, [hoveredCluster, data, totalSeats]);

  // Create invisible hover zones for each cluster
  const clusterZones = useMemo(() => {
    const zones = [];
    data.forEach(cluster => {
      const clusterSeats = seats.filter(s => s.cluster === cluster.cluster);
      if (clusterSeats.length === 0) return;
      
      // Find bounding box for this cluster
      const minX = Math.min(...clusterSeats.map(s => s.x));
      const maxX = Math.max(...clusterSeats.map(s => s.x));
      const minY = Math.min(...clusterSeats.map(s => s.y));
      const maxY = Math.max(...clusterSeats.map(s => s.y));
      
      zones.push({
        cluster: cluster.cluster,
        x: minX - 20,
        y: minY - 20,
        width: maxX - minX + 40,
        height: maxY - minY + 40
      });
    });
    return zones;
  }, [seats, data]);

  return (
    <div className="w-full h-screen bg-black flex flex-col items-center justify-center p-8">
      <h1 className="text-white text-5xl font-bold mb-12 tracking-wide">User Profiling</h1>

      <div className="relative">
        <svg width="800" height="600" className="overflow-visible">
          {/* Invisible hover zones for each cluster */}
          {clusterZones.map((zone, idx) => (
            <rect
              key={`zone-${idx}`}
              x={zone.x}
              y={zone.y}
              width={zone.width}
              height={zone.height}
              fill="transparent"
              className="cursor-pointer"
              onMouseEnter={() => setHoveredCluster(zone.cluster)}
              onMouseLeave={() => setHoveredCluster(null)}
            />
          ))}
          
          {/* Seats */}
          {seats.map((seat, idx) => (
            <circle
              key={idx}
              cx={seat.x}
              cy={seat.y}
              r={seat.radius}
              fill={seat.color}
              opacity={hoveredCluster === null || hoveredCluster === seat.cluster ? 1 : 0.3}
              className="transition-all duration-200 cursor-pointer pointer-events-none"
              style={{
                filter: hoveredCluster === seat.cluster ? 'brightness(1.15)' : 'none'
              }}
            />
          ))}

          <text
            x="400"
            y="430"
            textAnchor="middle"
            className="text-9xl font-bold fill-white select-none pointer-events-none"
            style={{ fontFamily: 'Arial, sans-serif', fontWeight: 700 }}
          >
            {centerInfo.size}
          </text>
          
          {hoveredCluster && (
            <text
              x="400"
              y="460"
              textAnchor="middle"
              className="text-xs fill-white select-none pointer-events-none"
            >
              {centerInfo.name}
            </text>
          )}
        </svg>
      </div>

      <div className="mt-10 bg-gray-900 rounded-lg p-6 w-full max-w-3xl border border-gray-800">
        <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-700">
          <h2 className="text-white text-lg font-semibold">Cluster</h2>
          <h2 className="text-white text-lg font-semibold">Cluster Size</h2>
        </div>
        {data.map((item, idx) => (
          <div
            key={idx}
            className="flex justify-between items-center py-3 px-4 rounded cursor-pointer transition-all duration-200"
            style={{
              backgroundColor: hoveredCluster === item.cluster ? 'rgba(255,255,255,0.1)' : 'transparent'
            }}
            onMouseEnter={() => setHoveredCluster(item.cluster)}
            onMouseLeave={() => setHoveredCluster(null)}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-white text-base">{item.cluster}</span>
            </div>
            <span className="text-white text-base font-medium">{item.size}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ParliamentChart;

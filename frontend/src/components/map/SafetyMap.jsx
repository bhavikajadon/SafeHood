import { useEffect, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import axios from "axios";
import { useSocket } from "../../hooks/useSocket";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const CATEGORY_COLORS = { harassment:"#c8794d", theft:"#d0a34f", assault:"#bd625d", suspicious:"#8379aa", other:"#718b78" };
function FlyTo({ coords }) { const map=useMap(); useEffect(()=>{if(coords)map.flyTo(coords,14,{duration:1.5});},[coords,map]); return null; }
function FitRoute({ route }) {
  const map = useMap();
  useEffect(() => {
    const coordinates = route?.geometry?.coordinates || [];
    if (coordinates.length > 1) {
      map.fitBounds(coordinates.map(([lng, lat]) => [lat, lng]), { padding: [48, 48] });
    }
  }, [route, map]);
  return null;
}

export default function SafetyMap({ city="Chennai", routePlan=null, selectedRouteIndex=0 }) {
  const [zones,setZones]=useState([]);
  const [reports,setReports]=useState([]);
  const [userLocation,setUserLocation]=useState(null);
  const [liveAlerts,setLiveAlerts]=useState([]);
  const [filter,setFilter]=useState("all");
  const [mapError,setMapError]=useState("");

  useEffect(()=>{
    let active=true;
    axios.get(`/api/zones?city=${encodeURIComponent(city)}`).then(r=>{if(active)setZones(r.data?.zones||[]);}).catch(()=>{});
    axios.get(`/api/reports?city=${encodeURIComponent(city)}`).then(r=>{if(active)setReports(r.data?.reports||[]);}).catch(()=>setMapError("Reports are temporarily unavailable."));
    return ()=>{active=false;};
  },[city]);

  useSocket(city,(newReport)=>{
    setReports(prev=>[newReport,...prev]);
    setLiveAlerts(prev=>[newReport,...prev.slice(0,2)]);
    window.setTimeout(()=>setLiveAlerts(prev=>prev.filter(item=>item!==newReport)),6500);
  });

  function locateMe(){
    if(!navigator.geolocation){setMapError("Location services are not available in this browser.");return;}
    navigator.geolocation.getCurrentPosition(({coords})=>{setUserLocation([coords.latitude,coords.longitude]);setMapError("");},()=>setMapError("Location permission was not granted. You can still explore the map."),{enableHighAccuracy:true,timeout:10000});
  }

  const filtered=filter==="all"?reports:reports.filter(r=>r.category===filter);
  const visibleZones=zones.filter(z=>z.location?.coordinates);
  const hasDemoData=visibleZones.some(zone=>zone.isDemoData)||filtered.some(report=>report.isDemoData);
  const categories=["all","harassment","theft","assault","suspicious"];
  const selectedRoute = routePlan?.routes?.[selectedRouteIndex] || routePlan?.routes?.[0] || null;

  return <div className="safety-map-shell">
    <div className="map-toolbar">
      <div className="map-filters"><span className="filter-label">SHOW</span>{categories.map(cat=><button key={cat} onClick={()=>setFilter(cat)} className={filter===cat?"filter-chip selected":"filter-chip"}>{cat==="all"?"All reports":cat}</button>)}</div>
      <div className="map-toolbar-actions">{hasDemoData&&<span className="demo-data-pill">Illustrative demo data</span>}<button className="locate-button" onClick={locateMe}><span>⌖</span> Locate me</button></div>
    </div>
    {mapError&&<div className="map-status" role="status">{mapError}<button onClick={()=>setMapError("")} aria-label="Dismiss">×</button></div>}
    {liveAlerts.length>0&&<div className="live-alert-stack">{liveAlerts.map((item,i)=><div key={item._id||i} className="live-alert"><span className="live-dot"/><span>New {item.category||"safety"} report received</span></div>)}</div>}
    <div className="map-canvas">
      <MapContainer center={[13.0827,80.2707]} zoom={12} scrollWheelZoom style={{width:"100%",height:"100%"}}>
        <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
        {userLocation&&<FlyTo coords={userLocation}/>}
        {selectedRoute&&<FitRoute route={selectedRoute}/>}
        {routePlan?.routes?.map((route,index)=>(
          <Polyline
            key={route.id}
            positions={route.geometry.coordinates.map(([lng,lat])=>[lat,lng])}
            pathOptions={{
              color:index===selectedRouteIndex?"#477a55":"#c28e55",
              weight:index===selectedRouteIndex?7:4,
              opacity:index===selectedRouteIndex?0.95:0.62,
              dashArray:index===selectedRouteIndex?undefined:"7 8",
            }}
          />
        ))}
        {visibleZones.map((zone,i)=>{const [lng,lat]=zone.location.coordinates;return lat&&lng?<CircleMarker key={zone._id||i} center={[lat,lng]} radius={Math.min(22,Math.max(9,zone.radius?zone.radius/30:14))} pathOptions={{color:zone.safetyScore>=61?"#658b70":zone.safetyScore>=31?"#c69a52":"#bd625d",fillOpacity:.2,weight:2}}><Popup><strong>{zone.name||"Safety zone"}</strong><br/>{zone.isDemoData?"Illustrative sample zone · not verified":"Community safety signal"}<br/>Score: {zone.safetyScore ?? "Not rated"}/100</Popup></CircleMarker>:null;})}
        {filtered.map((report,i)=>{if(!report.location?.coordinates)return null;const[lng,lat]=report.location.coordinates;if(!lat||!lng)return null;return <CircleMarker key={report._id||i} center={[lat,lng]} radius={7} pathOptions={{color:CATEGORY_COLORS[report.category]||CATEGORY_COLORS.other,fillColor:CATEGORY_COLORS[report.category]||CATEGORY_COLORS.other,fillOpacity:.82,weight:2}}><Popup><strong>{report.category||"Community report"}</strong><br/>{report.description||report.title||"A safety observation was shared here."}<br/>{report.isDemoData?"Illustrative sample report · not verified":"Community-submitted report"}</Popup></CircleMarker>;})}
      </MapContainer>
    </div>
    <div className="map-legend"><span className="legend-title">MAP KEY</span><span><i className="legend-dot safe"/> Safer signals</span><span><i className="legend-dot moderate"/> Caution</span><span><i className="legend-dot risk"/> Reports</span><span className="legend-count">{filtered.length} report{filtered.length===1?"":"s"}</span></div>
  </div>;
}

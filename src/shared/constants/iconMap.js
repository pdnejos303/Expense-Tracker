import Home from '@mui/icons-material/Home';
import ShoppingCart from '@mui/icons-material/ShoppingCart';
import Fastfood from '@mui/icons-material/Fastfood';
import LocalCafe from '@mui/icons-material/LocalCafe';
import DirectionsCar from '@mui/icons-material/DirectionsCar';
import Flight from '@mui/icons-material/Flight';
import MovieIcon from '@mui/icons-material/Movie';
import MusicNote from '@mui/icons-material/MusicNote';
import FitnessCenter from '@mui/icons-material/FitnessCenter';
import LocalHospital from '@mui/icons-material/LocalHospital';
import School from '@mui/icons-material/School';
import WorkIcon from '@mui/icons-material/Work';
import Pets from '@mui/icons-material/Pets';
import LocalGroceryStore from '@mui/icons-material/LocalGroceryStore';
import LocalGasStation from '@mui/icons-material/LocalGasStation';
import LocalAtm from '@mui/icons-material/LocalAtm';
import LocalLibrary from '@mui/icons-material/LocalLibrary';
import Restaurant from '@mui/icons-material/Restaurant';
import BeachAccess from '@mui/icons-material/BeachAccess';
import DirectionsBus from '@mui/icons-material/DirectionsBus';
import DirectionsWalk from '@mui/icons-material/DirectionsWalk';
import Train from '@mui/icons-material/Train';
import LocalHotel from '@mui/icons-material/LocalHotel';
import ChildCare from '@mui/icons-material/ChildCare';
import PaletteIcon from '@mui/icons-material/Palette';
import BookIcon from '@mui/icons-material/Book';
import LaptopMac from '@mui/icons-material/LaptopMac';
import PhoneIphone from '@mui/icons-material/PhoneIphone';
import LocalParking from '@mui/icons-material/LocalParking';
import LocalLaundryService from '@mui/icons-material/LocalLaundryService';
import LocalMall from '@mui/icons-material/LocalMall';
import Casino from '@mui/icons-material/Casino';
import Spa from '@mui/icons-material/Spa';
import LocalPharmacy from '@mui/icons-material/LocalPharmacy';
import LocalShipping from '@mui/icons-material/LocalShipping';
import LocalOffer from '@mui/icons-material/LocalOffer';
import LocalPostOffice from '@mui/icons-material/LocalPostOffice';
import LocalFlorist from '@mui/icons-material/LocalFlorist';
import LocalBar from '@mui/icons-material/LocalBar';
import DirectionsBike from '@mui/icons-material/DirectionsBike';
import DirectionsBoat from '@mui/icons-material/DirectionsBoat';
import LocalAirport from '@mui/icons-material/LocalAirport';
import CameraAlt from '@mui/icons-material/CameraAlt';
import BrushIcon from '@mui/icons-material/Brush';
import EventSeat from '@mui/icons-material/EventSeat';
import HeadsetMic from '@mui/icons-material/HeadsetMic';
import KeyboardIcon from '@mui/icons-material/Keyboard';
import VideogameAsset from '@mui/icons-material/VideogameAsset';
import WatchIcon from '@mui/icons-material/Watch';
import Weekend from '@mui/icons-material/Weekend';
import CategoryIcon from '@mui/icons-material/Category';

const iconMap = {
  Home, ShoppingCart, Fastfood, LocalCafe, DirectionsCar,
  Flight, Movie: MovieIcon, MusicNote, FitnessCenter, LocalHospital,
  School, Work: WorkIcon, Pets, LocalGroceryStore, LocalGasStation,
  LocalAtm, LocalLibrary, Restaurant, BeachAccess, DirectionsBus,
  DirectionsWalk, Train, LocalHotel, ChildCare, Palette: PaletteIcon,
  Book: BookIcon, LaptopMac, PhoneIphone, LocalParking, LocalLaundryService,
  LocalMall, Casino, Spa, LocalPharmacy, LocalShipping,
  LocalOffer, LocalPostOffice, LocalFlorist, LocalBar, DirectionsBike,
  DirectionsBoat, LocalAirport, CameraAlt, Brush: BrushIcon, EventSeat,
  HeadsetMic, Keyboard: KeyboardIcon, VideogameAsset, Watch: WatchIcon, Weekend,
  Category: CategoryIcon,
};

export const iconOptions = Object.keys(iconMap).filter((k) => k !== 'Category');

export default iconMap;

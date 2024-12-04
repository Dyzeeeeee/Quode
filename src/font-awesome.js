import { library } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

// Import specific icons
import { faStar, faHeart } from "@fortawesome/free-solid-svg-icons";
import { faVuejs } from "@fortawesome/free-brands-svg-icons";

// Add icons to the library
library.add(faStar, faHeart, faVuejs);

export default FontAwesomeIcon;
package transforms

import (
	"log"

	"github.com/raff/goble"
)

// public static int extractFeatureMask(UUID uuid) {
// 	return (int) (uuid.getMostSignificantBits() >> 32);
// }

// ST

func BuildFeatures(characteristic goble.ServiceCharacteristic) {

	log.Printf("buildFeatures for: %#v\n", characteristic)

}

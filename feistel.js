



function main() {
    var key = EnteredKey;
    var postwithPtag = Cleanpost;
    var postwithnoP = postwithPtag.replace("<p>", "").replace("</p>", "")
    var stringToEncrypt = postwithnoP;
    var bytesToEncrypt = ByteHelper.stringUTF8ToBytes(stringToEncrypt);


    var encryptor = new EncryptorFeistel(
        key,
        EncryptorFeistel.deriveRoundSubkeysFromKeySimple,
        EncryptorFeistel.encryptionFunctionForRoundSimple
    );

    bytesEncrypted = encryptor.encryptBytes(bytesToEncrypt);


    var bytesDecrypted = encryptor.decryptBytes(bytesEncrypted);


    var stringDecrypted = ByteHelper.bytesToStringUTF8(bytesDecrypted);

}


// classes

Array.prototype.overwriteWith = function (other) {
    this.length = 0;

    for (var i = 0; i < other.length; i++) {
        this[i] = other[i];
    }
}

function ByteHelper() {} {
    ByteHelper.BitsPerByte = 8;
    ByteHelper.BitsPerNibble = ByteHelper.BitsPerByte / 2;
    ByteHelper.ByteValueMax = Math.pow(2, ByteHelper.BitsPerByte) - 1;

    ByteHelper.bytesToStringUTF8 = function (bytesToConvert) {
        var returnValue = "";

        for (var i = 0; i < bytesToConvert.length; i++) {
            var charCode = bytesToConvert[i];
            var character = String.fromCharCode(charCode);
            returnValue += character;
        }

        return returnValue;
    }

    //change the decimal unicode to hexadecimal
    ByteHelper.bytesToStringHexadecimal = function (bytesToConvert) {
        var returnValue = "";

        var bitsPerNibble = ByteHelper.BitsPerNibble;

        for (var i = 0; i < bytesToConvert.length; i++) {
            var byte = bytesToConvert[i];

            for (var d = 1; d >= 0; d--) {
                var digitValue = byte >> (bitsPerNibble * d) & 0xF;
                var digitString = "";
                digitString += (digitValue < 10 ? digitValue : String.fromCharCode(55 + digitValue));
                returnValue += digitString;
            }

            returnValue += " ";
        }

        return returnValue;
    }

    ByteHelper.bytesToNumber = function (bytes) {
        var returnValue = 0;

        var bitsPerByte = ByteHelper.BitsPerByte;

        for (var i = 0; i < bytes.length; i++) {
            var byte = bytes[i];
            var byteValue = (byte << (bitsPerByte * i));
            returnValue += byteValue;
        }

        return returnValue;
    }

    ByteHelper.numberOfBytesNeededToStoreNumber = function (number) {
        var numberOfBitsInNumber = Math.ceil(
            Math.log(number + 1) / Math.log(2)
        );

        var numberOfBytesNeeded = Math.ceil(
            numberOfBitsInNumber /
            ByteHelper.BitsPerByte
        );

        return numberOfBytesNeeded;
    }

    ByteHelper.numberToBytes = function (number, numberOfBytesToUse) {
        var returnValues = [];

        if (numberOfBytesToUse == null) {
            numberOfBytesToUse = this.numberOfBytesNeededToStoreNumber(
                number
            );
        }

        var bitsPerByte = ByteHelper.BitsPerByte;

        for (var i = 0; i < numberOfBytesToUse; i++) {
            var byte = (number >> (bitsPerByte * i)) & 0xFF;
            returnValues.push(byte);
        }

        return returnValues;
    }

    //return the unicode array of characters
    ByteHelper.stringUTF8ToBytes = function (stringToConvert) {
        var returnValues = [];

        for (var i = 0; i < stringToConvert.length; i++) {
            var charCode = stringToConvert.charCodeAt(i);
            returnValues.push(charCode);
        }
        return returnValues;
    }

    ByteHelper.xorBytesWithOthers = function (bytes0, bytes1) {
        for (var i = 0; i < bytes0.length; i++) {
            bytes0[i] ^= bytes1[i];
        }

        return bytes0;
    }
}

function EncryptorFeistel(
    key,
    deriveRoundSubkeysFromKey,
    encryptionFunctionForRound
) {
    this.key = key;
    this.deriveRoundSubkeysFromKey = deriveRoundSubkeysFromKey;
    this.encryptionFunctionForRound = encryptionFunctionForRound;
} {

    //creating keys from the given key
    EncryptorFeistel.deriveRoundSubkeysFromKeySimple = function (keyAs32BitInteger) {
        var returnValues = [];

        for (var r = 0; r < 16; r++) {
            var subkeyForRound = (keyAs32BitInteger >> (r * ByteHelper.BitsPerByte)) & 0xFF;

            returnValues.push(subkeyForRound);
        }
        return returnValues;
    }

    // Khordkon function(F function)
    EncryptorFeistel.encryptionFunctionForRoundSimple = function (right, key) {
        // Simple, and presumably easy to crack.

        for (var i = 0; i < right.length; i++) {
            right[i] = (right[i] + key) % ByteHelper.ByteValueMax;

        }

    }

    // instance methods


    EncryptorFeistel.prototype.decryptBytes = function (bytesToDecrypt) {
        var returnValues = this.encryptOrDecryptBytes(
            bytesToDecrypt,
            true // decryptRatherThanEncrypt
        );

        return returnValues;
    }

    //make the array even if not
    EncryptorFeistel.prototype.encryptBytes = function (bytesToEncrypt) {
        if (bytesToEncrypt.length % 2 == 1) {
            // hack - length must be even!
            bytesToEncrypt.push(0);
        }

        var returnValues = this.encryptOrDecryptBytes(
            bytesToEncrypt,
            false // decryptRatherThanEncrypt
        );

        return returnValues;
    }

    // divide the array to left and right
    EncryptorFeistel.prototype.encryptOrDecryptBytes = function (
        bytesToEncryptOrDecrypt,
        decryptRatherThanEncrypt
    ) {
        var subkeysForRounds = this.deriveRoundSubkeysFromKey(
            this.key
        );
        var numberOfRounds = subkeysForRounds.length;
        //var numberOfRounds = 16;

        var numberOfBytes = bytesToEncryptOrDecrypt.length;
        var numberOfBytesHalf = numberOfBytes / 2;

        var left = bytesToEncryptOrDecrypt.slice(
            0, numberOfBytesHalf
        );
        var right = bytesToEncryptOrDecrypt.slice(
            numberOfBytesHalf
        );

        var leftNext = left.slice(0);
        var rightNext = right.slice(0);

        for (var r = 0; r < numberOfRounds; r++) {
            var subkeyIndex = (decryptRatherThanEncrypt ? numberOfRounds - r - 1 : r);
            var subkeyForRound = subkeysForRounds[subkeyIndex];
            // Probably some needlessly inefficient calls 
            // to overwriteWith() happening in this block.

            leftNext.overwriteWith(right);
            rightNext.overwriteWith(left);

            this.encryptionFunctionForRound(
                right, subkeyForRound
            );
            ByteHelper.xorBytesWithOthers(
                rightNext,
                right
            )

            left.overwriteWith(leftNext);
            right.overwriteWith(rightNext);
        }

        var returnValue = [].concat(right).concat(left);

        return returnValue;
    }
}
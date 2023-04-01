// gcsHelper.js
const { Storage } = require('@google-cloud/storage');
const path = require('path');
let projectId = 'custom-casing-329708'; // Get this from Google Cloud
let keyFilename = path.join(__dirname, '../custom-casing-329708-e571fcedc481.json'); // Get this from Google Cloud
const gc = new Storage({ projectId, keyFilename });

// gcsHelper.js
// ...

async function uploadFilesToGCS(files, bucketName) {
	if (!files || files.length === 0) return [];
	const gcBucket = await gc.bucket(bucketName);

	const uploadPromises = files.map(async (file) => {
		const currentDate = Date.now();
		const updatedFilename = `${currentDate}-${file.originalname}`;
		const blob = gcBucket.file(updatedFilename);
		const blobStream = await blob.createWriteStream({
			metadata: {
				contentType: file.mimetype,
			},
			resumable: false,
		});

		return new Promise((resolve, reject) => {
			blobStream.on('finish', () => {
				// Add the desired metadata to the object
				const fileMetadata = {
					originalname: file.originalname,
					fieldname: file.fieldname,
					filename: updatedFilename,
					mimeType: file.mimetype,
					size: file.size,
					bucket: bucketName,
				};
				resolve(fileMetadata);
			});
			blobStream.on('error', reject);
			blobStream.end(file.buffer);
		});
	});

	const uploadedFilesMetadata = await Promise.all(uploadPromises);
	return uploadedFilesMetadata;
}


module.exports = { uploadFilesToGCS };

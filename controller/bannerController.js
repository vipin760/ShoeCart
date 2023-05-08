const Banner = require('../models/bannerModel');

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const loadBannerPage = async (req, res) => {
  try {
    const admin = req.session.isAdminLoggedIn;
    if (admin) {
      res.render('add-banner');

    } else {
      res.redirect('/admin/admin-login');
    }

  } catch (error) {
    console.log(error.message);
    res.render('error');
  }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const insertBanner = async (req, res) => {
  try {
    const admin = req.session.isAdminLoggedIn;
    if (admin) {
      const { bannerTitle1, bannerTitle2, price, thumbnail } = req.body;

      if (!bannerTitle1 || !bannerTitle2 || !price || !thumbnail) {
        res.render('add-banner', { message: "please add correct data" })


      } else {
        let imagesUpload = []
        for (let i = 0; i < req.files.length; i++) {
          imagesUpload[i] = req.files[i].filename
        }

        const saveBanner = new Banner({
          bannerTitle1: bannerTitle1,
          bannerTitle2: bannerTitle2,
          price: price,
          thumbnail: thumbnail,
          images: imagesUpload
        })
        await saveBanner.save().then((p) => {
          res.render('add-banner', { message: "banner added successfully" })
        })
      }



    } else {
      res.redirect('/admin/admin-login');
    }
  } catch (error) {
    console.log(error.message);
    res.render('error');
  }
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const loadBannerList = async (req, res) => {
  try {
    const admin = req.session.isAdminLoggedIn;
    if (admin) {
      const bannerData = await Banner.find();
      if (bannerData) {
          res.render('banner-list', { admin, bannerData});
      } else {
        res.render('banner-list', { admin, bannerData: '' });
      }

    } else {
      res.redirect('/admin/admin-login');
    }

  } catch (error) {
    console.log(error.message);
    res.render('error');
  }
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const loadeditBanner = async (req, res) => {
  try {
    const admin = req.session.isAdminLoggedIn;
    if (admin) {
      const bannerId = req.query.id;
      const bannerData = await Banner.findOne({ _id: bannerId });
      if (bannerData) {
        res.render("edit-banner", { admin, bannerData });

      } else {
        res.redirect('/admin/banner-list');
      }

    } else {
      res.redirect('/admin/admin-login');
    }
  } catch (error) {
    console.log(error.message)
    res.render('error');
  }
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const insertEditbanner = async (req, res) => {
  try {
    const admin = req.session.isAdminLoggedIn;
    if (admin) {
      const { bannerTitle1, bannerTitle2, price, thumbnail, bannerId } = req.body;
      if (req.files.length === 1) {
        let imagesUpload = []
        for (let i = 0; i < req.files.length; i++) {
          imagesUpload[i] = req.files[i].filename
        }
        const updateOne = await Banner.updateOne({ _id: bannerId }, {
          $set: {
            bannerTitle1: bannerTitle1,
            bannerTitle2: bannerTitle2,
            price: price,
            thumbnail: thumbnail,
            images: imagesUpload
          }
        }).then(p => {
          res.redirect('/admin/banner-list');
        });


      } else {
        const updateOne = await Banner.updateOne({ _id: bannerId }, {
          $set: {
            bannerTitle1: bannerTitle1,
            bannerTitle2: bannerTitle2,
            price: price,
            thumbnail: thumbnail
          }
        }).then(p => {
         
          res.redirect('/admin/banner-list');
        });

      }
    } else {
      res.redirect('/admin/admin-login');
    }


  } catch (error) {
    console.log(error.message);
    res.render('error');
  }
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const deleteBanner = async (req, res) => {
  try {
    const admin = req.session.isAdminLoggedIn;
    if (admin) {
      const id = req.query.id;
      await Banner.deleteOne({ _id: id }).then(() => {
        res.redirect('/admin/banner-list');
      })


    } else {
      res.redirect('/admin/admin-login');
    }

  } catch (error) {
    console.log(error.message);
    res.render('error');
  }
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const unlistBanner = async (req,res)=>{
  try {
    const admin = req.session.isAdminLoggedIn;
        const id = req.query.id;
        if(admin){

          const update = await Banner.updateOne({_id:id}, { $set: {list : 0}});
          res.redirect('/admin/banner-list');
    
        }else{
          res.redirect('/admin/admin-login');
        }
  } catch (error) {
    console.log(error.message)
  }
}


////////////////////////////////////////////////////////////////////////////////////////////////////////

const listBanner = async (req,res)=>{
  try {
    const admin = req.session.isAdminLoggedIn;
        const id = req.query.id;
        if(admin){
          const update = await Banner.updateOne({_id:id}, { $set: {list : 1}});
          
          res.redirect('/admin/banner-list');
    
        }else{
          res.redirect('/admin/admin-login');
        }
  } catch (error) {
    console.log(error.message)
  }
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////




module.exports = {
  loadBannerPage,
  insertBanner,
  loadBannerList,
  loadeditBanner,
  insertEditbanner,
  deleteBanner,
  listBanner,
  unlistBanner
}